import PushNotification from 'react-native-push-notification';
import { max, eachWeekOfInterval, setDay, format, subMinutes } from 'date-fns';

import { Schedule, ClassItem } from '../types/schedule';
import { DatesState } from '../types/store';
import { getScheduleTypeOnDate, convertTimeToDate } from './query-schedule';
import * as SCHEDULES from '../constants/schedules';
import { NO_HOMEROOM_TITLE, PACKAGE_NAME } from '../constants/fetch';

// TODO: iOS only supports 64 notifications at once, rewrite
// to background task

export default class NotificationManager {
  constructor() {
    PushNotification.configure({
      permissions: {
        alert: true,
        sound: true,
      },
    });
  }

  public registerNotifications(schedule: Schedule, dates: DatesState) {
    this.cancelCurrentNotifications();
    if (dates.semesterTwoEnd !== null && dates.semesterOneStart !== null) {
      const sundaysUntilEnd = eachWeekOfInterval({
        start: max([new Date(), dates.semesterOneStart]),
        end: dates.semesterTwoEnd,
      });

      for (const day of [1, 2, 3, 4, 5]) {
        sundaysUntilEnd.forEach((sunday) => {
          const weekday = setDay(sunday, day, { weekStartsOn: 1 });
          const userDaySchedule = schedule[day - 1];
          const dayScheduleType = getScheduleTypeOnDate(weekday, dates);
          if (['FINALS', 'BREAK', 'WEEKEND', 'SUMMER'].includes(dayScheduleType)) {
            return;
          }

          const daySchedule = SCHEDULES.REGULAR//[dayScheduleType];
          userDaySchedule.forEach((scheduleItem) => {
            const isCrossSection = scheduleItem.hasOwnProperty('columns');
            if (!isCrossSection && (scheduleItem as ClassItem).title === NO_HOMEROOM_TITLE) {
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
            const id = `${format(weekday, 'yyyyMMdd')}${classStartMod.toString().padStart(2, '0')}`;

            PushNotification.localNotificationSchedule({
              title: 'Next Class',
              message,
              id, userInfo: { id },
              ticker: message,
              tag: `${PACKAGE_NAME}.id.${id}`,
              largeIcon: '',
              smallIcon: 'ic_launcher',
              visibility: 'public',
              ongoing: false,
              date: subMinutes(convertTimeToDate(classStartTime), 5),
            });
          });
        });
      }
    }
  }

  public cancelCurrentNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }
}
