import { Platform } from 'react-native';
import PushNotification, { PushNotificationPermissions } from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import BackgroundFetch from 'react-native-background-fetch';
import { max, eachWeekOfInterval, setDay, format, subMinutes } from 'date-fns';

import { ClassItem, ScheduleItem, DaySchedule } from '../types/schedule';
import { store } from './store';
import { getScheduleTypeOnDate, convertTimeToDate, getModAtTime } from './query-schedule';
import * as SCHEDULES from '../constants/schedules';
import {
  NO_HOMEROOM_TITLE, PACKAGE_NAME, IOS_MAX_NOTIFICATIONS, MAX_NOTIFICATION_SETUP_TIMEOUT,
} from '../constants/fetch';
import { last } from './utils';
import { injectAssemblyOrFinalsIfNeeded } from './process-schedule';
import client from './bugsnag';

export function scheduleNotificationForScheduleItem(
  scheduleItem: ScheduleItem, daySchedule: DaySchedule, fireDate: Date,
) {
  // No notifications for 'no homeroom' schedule item on wednesdays
  const isCrossSection = scheduleItem.hasOwnProperty('columns');
  const classItem = scheduleItem as ClassItem;
  if (!isCrossSection && classItem.title === NO_HOMEROOM_TITLE) {
    return;
  }

  let message;
  if (isCrossSection) {
    message = 'You\'re cross sectioned for your next class, please check your schedule';
  } else {
    const { title, body, sourceType } = scheduleItem as ClassItem;
    if (sourceType === 'open') {
      message = 'You\'re open next mod!';
    } else {
      const roomNumber = body.replace(/\s+\(.+\)\s*/, '');
      message = `Your next class is ${title} in ${roomNumber}`;
    }
  }

  const dayScheduleIndex = daySchedule.findIndex(([, , modNumber]) => modNumber === scheduleItem.startMod);
  const [classStartTime, , classStartMod] = daySchedule[dayScheduleIndex];
  const id = `${format(fireDate, 'yyyyMMdd')}${classStartMod.toString().padStart(2, '0')}`;

  PushNotification.localNotificationSchedule({
    title: 'Next Class',
    message,
    id, userInfo: { id },
    ticker: message,
    tag: `${PACKAGE_NAME}.id.${id}`,
    visibility: 'public',
    ongoing: false,
    // from my fork
    firePast: false,
    date: subMinutes(convertTimeToDate(classStartTime, fireDate), 5),
  });
}

function checkForPermissions(): Promise<PushNotificationPermissions> {
  return new Promise((resolve) => {
    PushNotification.checkPermissions((permissions) => resolve(permissions));
  });
}

export async function scheduleNotifications() {
  const permissions = await checkForPermissions();
  if (!permissions.alert) {
    PushNotification.cancelAllLocalNotifications();
    return BackgroundFetch.FETCH_RESULT_NO_DATA;
  }

  PushNotification.cancelAllLocalNotifications();

  const start = new Date();
  const currentNotifications: object[] = await new Promise((resolve) => {
    if (Platform.OS === 'android') {
      return resolve([]);
    }
    PushNotificationIOS.getScheduledLocalNotifications((notifications: object[]) => {
      resolve(notifications);
    });
  });
  const noCurrentNotifications = currentNotifications.length;

  if (noCurrentNotifications < IOS_MAX_NOTIFICATIONS) {
    const { dates, user: { schedule } } = store.getState();
    if (dates.semesterTwoEnd !== null && dates.semesterOneStart !== null) {
      const sundaysUntilEnd = eachWeekOfInterval({
        start: max([start, dates.semesterOneStart]),
        end: dates.semesterTwoEnd,
      });

      let count = 0;
      for (const sunday of sundaysUntilEnd) {
        for (const day of [1, 2, 3, 4, 5]) {
          const weekday = setDay(sunday, day, { weekStartsOn: start.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
          const dayScheduleType = getScheduleTypeOnDate(weekday, dates);
          const userDaySchedule = injectAssemblyOrFinalsIfNeeded(schedule[day - 1], dayScheduleType, day);
          if (['FINALS', 'BREAK', 'WEEKEND', 'SUMMER'].includes(dayScheduleType)) {
            continue;
          }

          const daySchedule = SCHEDULES[dayScheduleType];
          for (const scheduleItem of userDaySchedule) {
            // only schedule notifications after current mod
            const { current, next } = getModAtTime(start, daySchedule);
            if (scheduleItem.startMod <= current || scheduleItem.startMod <= next) {
              continue;
            }

            // Background fetches only allowed 30 seconds by iOS
            if (Date.now() - start.getTime() >= MAX_NOTIFICATION_SETUP_TIMEOUT) {
              return BackgroundFetch.FETCH_RESULT_NEW_DATA;
            }
            if (count === IOS_MAX_NOTIFICATIONS - noCurrentNotifications) {
              return BackgroundFetch.FETCH_RESULT_NEW_DATA;
            }
            scheduleNotificationForScheduleItem(scheduleItem, daySchedule, weekday);
            count++;
          }
        }
      }
    }
  }
  return BackgroundFetch.FETCH_RESULT_NO_DATA;
}

export async function notificationScheduler() {
  client.leaveBreadcrumb('Running background task');
  const status = await scheduleNotifications();
  BackgroundFetch.finish(status);
}

export default async function registerNotificationScheduler() {
  PushNotification.configure({
    onNotification: (notification) => {
      notification.finish(PushNotificationIOS.FETCH_RESULT_NO_DATA);
    },
    permissions: {
      alert: true,
      sound: true,
    },
  });
  BackgroundFetch.stop();

  const { alert } = await checkForPermissions();
  if (alert) {
    BackgroundFetch.configure({
      minimumFetchInterval: 40,
      stopOnTerminate: false,
      startOnBoot: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      enableHeadless: true,
    }, notificationScheduler);
  }
}
