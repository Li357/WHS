import PushNotification, { PushNotificationPermissions } from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import BackgroundFetch from 'react-native-background-fetch';
import { max, eachWeekOfInterval, setDay, format, subMinutes, isAfter, isSameDay, startOfDay } from 'date-fns';

import { ClassItem, ScheduleItem, DaySchedule, ModNumber } from '../types/schedule';
import { store } from './store';
import { convertTimeToDate, getModAtTime, getScheduleTypeOnDate, getPlanOnDate, containsDate } from './query-schedule';
import * as SCHEDULES from '../constants/schedules';
import {
  NO_HOMEROOM_TITLE,
  PACKAGE_NAME,
  IOS_MAX_NOTIFICATIONS,
  MAX_NOTIFICATION_SETUP_TIMEOUT,
} from '../constants/fetch';
import { injectAssemblyOrFinalsIfNeeded } from './process-schedule';
import client from './bugsnag';

export function scheduleNotificationForScheduleItem(
  scheduleItem: ScheduleItem,
  daySchedule: DaySchedule,
  fireDate: Date,
) {
  // No notifications for 'no homeroom' schedule item on wednesdays
  const isCrossSection = scheduleItem.hasOwnProperty('columns');
  const classItem = scheduleItem as ClassItem;
  if (!isCrossSection && classItem.title === NO_HOMEROOM_TITLE) {
    return;
  }

  let message: string;
  if (isCrossSection) {
    message = "You're cross sectioned for your next class, please check your schedule";
  } else {
    const { title, body, sourceType } = scheduleItem as ClassItem;
    if (sourceType === 'open') {
      message = "You're open next mod!";
    } else {
      const roomNumber = body.replace(/\s+\(.+\)\s*/, '');
      message = `Your next class is ${title}${roomNumber.length > 0 ? ` in ${roomNumber}` : ''}`;
    }
  }

  const dayScheduleIndex = daySchedule.findIndex(([, , modNumber]) => modNumber === scheduleItem.startMod);
  const [classStartTime, , classStartMod] = daySchedule[dayScheduleIndex];
  const id = `${format(fireDate, 'yyyyMMdd')}${classStartMod.toString().padStart(2, '0')}`;

  PushNotification.localNotificationSchedule({
    title: 'Next Class',
    message,
    id,
    userInfo: { id },
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
  const {
    dates,
    elearningPlans,
    customDates,
    user: { schedule },
    day: { refreshedSemesterTwo },
  } = store.getState();
  // No notifications during elearning, less annoying hopefully.
  if (getPlanOnDate(start, elearningPlans) !== undefined) {
    return BackgroundFetch.FETCH_RESULT_NO_DATA;
  }

  if (dates.semesterTwoEnd !== null && dates.semesterOneStart !== null && dates.semesterOneEnd) {
    const sundaysUntilEnd = eachWeekOfInterval({
      start: max([startOfDay(start), dates.semesterOneStart]), // startOfDay prevents invalid interval since all dates from server are at 12AM
      end: dates.semesterTwoEnd,
    });

    let count = 0;
    for (const sunday of sundaysUntilEnd) {
      for (const day of [1, 2, 3, 4, 5]) {
        const weekday = setDay(sunday, day, { weekStartsOn: start.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6 });
        // Don't schedule new notifications because schedule changes after semester one
        if (isAfter(weekday, dates.semesterOneEnd) && !refreshedSemesterTwo) {
          continue;
        }

        const dayScheduleType = getScheduleTypeOnDate(weekday, dates, customDates, elearningPlans);
        if (['FINALS', 'BREAK', 'WEEKEND', 'SUMMER'].includes(dayScheduleType)) {
          continue;
        }

        const daySchedule = SCHEDULES[dayScheduleType];
        // accounts for custom dates, i.e. on server-side and e-learning when a Friday (calendar day) might have a day 2 schedule (userSchedule day)
        const customDateIfExists = customDates.find((customDate) => isSameDay(new Date(customDate.date), weekday));
        const userScheduleIndex = customDateIfExists ? customDateIfExists.scheduleDay : day - 1; // the former is already 0-based, the latter isn't

        // select user's class schedule based on the userSchedule day, not calendar day
        const userDaySchedule = injectAssemblyOrFinalsIfNeeded(
          schedule[userScheduleIndex],
          dayScheduleType,
          userScheduleIndex + 1,
        );

        // See process-schedule.js and replaceHomeroom
        // To accomodate custom schedules, i.e. Wednesdays (calendar day) that follow a regular schedule (in class),
        // the userDaySchedule array for all Wednesdays includes a homeroom mod, but is not found in the Wednesday schedule
        // in constants/schedule.ts. So, it is filtered so that an error does not occur in scheduleNotificationForScheduleItem
        const withoutHomeroom =
          dayScheduleType === 'WEDNESDAY'
            ? userDaySchedule.filter((scheduleItem) => scheduleItem.startMod !== ModNumber.HOMEROOM)
            : userDaySchedule;

        for (const scheduleItem of withoutHomeroom) {
          if (isSameDay(start, weekday)) {
            // only schedule notifications after current mod
            const { current, next } = getModAtTime(start, daySchedule);
            if (scheduleItem.startMod <= current && scheduleItem.startMod <= next) {
              continue;
            }
          }

          // Background fetches only allowed 30 seconds by iOS
          if (Date.now() - start.getTime() >= MAX_NOTIFICATION_SETUP_TIMEOUT) {
            return BackgroundFetch.FETCH_RESULT_NEW_DATA;
          }
          if (count === IOS_MAX_NOTIFICATIONS) {
            return BackgroundFetch.FETCH_RESULT_NEW_DATA;
          }
          scheduleNotificationForScheduleItem(scheduleItem, daySchedule, weekday);
          count++;
        }
      }
    }
  }
  return BackgroundFetch.FETCH_RESULT_NEW_DATA;
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
    BackgroundFetch.configure(
      {
        minimumFetchInterval: 40,
        stopOnTerminate: false,
        startOnBoot: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
        enableHeadless: true,
      },
      notificationScheduler,
    );
  }
}
