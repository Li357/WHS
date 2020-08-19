import React, { useEffect, useState } from 'react';
import { AppState as RNAppState, AppStateStatus } from 'react-native';
import { batch } from 'react-redux';
import { differenceInSeconds } from 'date-fns';

import { getCountdown, getScheduleInfoAtTime, convertTimeToDate } from '../../utils/query-schedule';
import { getDashboardInfo } from '../../utils/dashboard-info';
import InfoCard from './InfoCard';
import CrossSectionedCard from './CrossSectionedCard';
import { DaySchedule, ModNumber, UserDaySchedule } from '../../types/schedule';
import { last } from '../../utils/utils';
import { NavigationProp } from '../../types/utils';

interface InfoProps {
  daySchedule: DaySchedule;
  userDaySchedule: UserDaySchedule;
  navigation: NavigationProp;
}

export default function Info({ daySchedule, userDaySchedule, navigation }: InfoProps) {
  const now = new Date();
  const [scheduleInfo, setScheduleInfo] = useState(() => getScheduleInfoAtTime(now, daySchedule, userDaySchedule));
  const [countdown, setCountdown] = useState(() => getCountdown(now, scheduleInfo, daySchedule));
  const [dashboardInfo, setDashboardInfo] = useState(() => getDashboardInfo(daySchedule, userDaySchedule, scheduleInfo));

  const dayEndTime = daySchedule.length !== 0 ? convertTimeToDate(last(daySchedule)[1]) : now;
  const dayEnd = scheduleInfo.current !== ModNumber.UNKNOWN ? dayEndTime : now;
  const [endCountdown, setEndCountdown] = useState(() => Math.max(0, differenceInSeconds(dayEnd, now)));
  const [finished, setFinished] = useState(endCountdown === 0);
  const [inactive, setInactive] = useState(false);

  useEffect(() => {
    if (!finished && !inactive) {
      // updating countdown causes timeout to be reset, i.e. an interval
      const id: NodeJS.Timeout = setTimeout(() => {
        if (countdown === 0) {
          const future = new Date();
          const nextScheduleInfo = getScheduleInfoAtTime(future, daySchedule, userDaySchedule);
          // Recompute to stay consistent with other countdowns
          const untilDayEnd = differenceInSeconds(dayEnd, future);

          return batch(() => {
            setDashboardInfo(getDashboardInfo(daySchedule, userDaySchedule, nextScheduleInfo));
            setScheduleInfo(nextScheduleInfo);
            if (endCountdown > 0) {
              setCountdown(getCountdown(future, nextScheduleInfo, daySchedule));
              setEndCountdown(untilDayEnd);
              return;
            }
            setFinished(true);
          });
        }
        batch(() => {
          setCountdown((prev) => prev - 1);
          setEndCountdown((prev) => prev - 1);
        });
      }, 1000);
      return () => clearTimeout(id);
    }
  }, [inactive, scheduleInfo, daySchedule, userDaySchedule, countdown, endCountdown, dashboardInfo]);

  const updateInfo = (newStatus: AppStateStatus) => {
    switch (newStatus) {
      case 'inactive':
        setInactive(true);
        return;
      case 'active':
        batch(() => {
          const openDate = new Date();
          const newScheduleInfo = getScheduleInfoAtTime(openDate, daySchedule, userDaySchedule);
          const newDayEndTime = daySchedule.length !== 0 ? convertTimeToDate(last(daySchedule)[1]) : openDate;
          const newDayEnd = newScheduleInfo.current !== ModNumber.UNKNOWN ? newDayEndTime : openDate;
          const newEndCountdown = Math.max(0, differenceInSeconds(newDayEnd, openDate));

          setScheduleInfo(newScheduleInfo);
          setCountdown(getCountdown(openDate, newScheduleInfo, daySchedule));
          setEndCountdown(newEndCountdown);
          setDashboardInfo(getDashboardInfo(daySchedule, userDaySchedule, newScheduleInfo));
          setFinished(newEndCountdown === 0);
          setInactive(false);
        });
    }
  };
  useEffect(() => {
    RNAppState.addEventListener('change', updateInfo);
    return () => RNAppState.removeEventListener('change', updateInfo);
  }, [daySchedule, userDaySchedule]);
  useEffect(() => {
    const willBlurSubscription = navigation.addListener('willBlur', () => updateInfo('inactive'));
    const willFocusSubscription = navigation.addListener('willFocus', () => updateInfo('active'));
    return () => {
      willBlurSubscription.remove();
      willFocusSubscription.remove();
    };
  }, [daySchedule, userDaySchedule]);

  const cards = dashboardInfo.map((getter, index) => {
    const info = getter(countdown, scheduleInfo, endCountdown);
    const Card = info.title === 'Cross Sectioned' ? CrossSectionedCard : InfoCard;
    return <Card key={index} {...info} />;
  });
  return <>{cards}</>;
}
