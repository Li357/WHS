import React, { useEffect, useState } from 'react';
import { AppState as RNAppState, AppStateStatus } from 'react-native';
import { batch } from 'react-redux';
import { differenceInSeconds } from 'date-fns';

import { getCountdown, getScheduleInfoAtTime, convertTimeToDate } from '../../utils/query-schedule';
import { getDashboardInfo } from '../../utils/dashboard-info';
import InfoCard from './InfoCard';
import CrossSectionedCard from './CrossSectionedCard';
import { DaySchedule, Schedule, ModNumber } from '../../types/schedule';

interface InfoProps {
  daySchedule: DaySchedule;
  userSchedule: Schedule;
}

export default function Info({ daySchedule, userSchedule }: InfoProps) {
  const now = new Date();
  const [scheduleInfo, setScheduleInfo] = useState(() => getScheduleInfoAtTime(now, daySchedule, userSchedule));
  const [countdown, setCountdown] = useState(() => getCountdown(now, scheduleInfo, daySchedule));
  const [dashboardInfo, setDashboardInfo] = useState(() => getDashboardInfo(daySchedule, userSchedule, scheduleInfo));

  const dayEnd = scheduleInfo.current !== ModNumber.UNKNOWN
    ? convertTimeToDate(daySchedule.slice(-1)[0][1])
    : now;
  const [endCountdown, setEndCountdown] = useState(() => (
    Math.max(0, differenceInSeconds(dayEnd, now))
  ));
  const [finished, setFinished] = useState(endCountdown === 0);
  const [inactive, setInactive] = useState(false);

  useEffect(() => {
    if (!finished && !inactive) {
      // updating countdown causes timeout to be reset, i.e. an interval
      const id: NodeJS.Timeout = setTimeout(() => {
        if (countdown === 0) {
          const future = new Date();
          const nextScheduleInfo = getScheduleInfoAtTime(future, daySchedule, userSchedule);
          // Recompute to stay consistent with other countdowns
          const untilDayEnd = differenceInSeconds(dayEnd, future);

          return batch(() => {
            setDashboardInfo(getDashboardInfo(daySchedule, userSchedule, nextScheduleInfo));
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
  }, [inactive, scheduleInfo, daySchedule, userSchedule, countdown, endCountdown, dashboardInfo]);

  const updateInfo = (newStatus: AppStateStatus) => {
    switch (newStatus) {
      case 'inactive':
        setInactive(true);
        return;
      case 'active':
        batch(() => {
          const openDate = new Date();
          const newScheduleInfo = getScheduleInfoAtTime(openDate, daySchedule, userSchedule);
          setScheduleInfo(newScheduleInfo);
          setCountdown(getCountdown(openDate, newScheduleInfo, daySchedule));
          setDashboardInfo(getDashboardInfo(daySchedule, userSchedule, newScheduleInfo));
          setInactive(false);
        });
    }
  };
  useEffect(() => {
    RNAppState.addEventListener('change', updateInfo);
    return () => RNAppState.removeEventListener('change', updateInfo);
  }, [daySchedule, userSchedule]);

  const cards = dashboardInfo.map((getter, index) => {
    const info = getter(countdown, scheduleInfo, endCountdown);
    const Card = info.title === 'Cross Sectioned' ? CrossSectionedCard : InfoCard;
    return (<Card key={index} {...info} />);
  });
  return (<>{cards}</>);
}
