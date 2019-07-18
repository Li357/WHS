import React, { useEffect, useState } from 'react';
import { batch } from 'react-redux';
import { differenceInSeconds } from 'date-fns';

import { getCountdown, getScheduleInfoAtTime, convertTimeToDate } from '../../utils/query-schedule';
import { getDashboardInfo } from '../../utils/dashboard-info';
import InfoCard from './InfoCard';
import CrossSectionedCard from './CrossSectionedCard';
import { DaySchedule, Schedule } from '../../types/schedule';

interface InfoProps {
  daySchedule: DaySchedule;
  userSchedule: Schedule;
}

export default function Info({ daySchedule, userSchedule }: InfoProps) {
  const now = new Date();
  const [scheduleInfo, setScheduleInfo] = useState(() => getScheduleInfoAtTime(now, daySchedule, userSchedule));
  const [countdown, setCountdown] = useState(() => getCountdown(now, scheduleInfo, daySchedule));
  const [dashboardInfo, setDashboardInfo] = useState(() => getDashboardInfo(scheduleInfo));

  const dayEnd = daySchedule.slice(-1)[0][1];
  const [endCountdown, setEndCountdown] = useState(() => (
    differenceInSeconds(convertTimeToDate(dayEnd), now)
  ));

  useEffect(() => {
    const id: NodeJS.Timeout = setTimeout(() => {
      if (countdown === 0) {
        if (endCountdown === 0) {
          return clearTimeout(id);
        }

        const future = new Date();
        const nextScheduleInfo = getScheduleInfoAtTime(future, daySchedule, userSchedule);
        // Recompute to stay consistent with other countdowns
        const untilDayEnd = differenceInSeconds(convertTimeToDate(dayEnd), future);

        return batch(() => {
          setDashboardInfo(getDashboardInfo(nextScheduleInfo));
          setScheduleInfo(nextScheduleInfo);
          setCountdown(getCountdown(future, nextScheduleInfo, daySchedule));
          setEndCountdown(untilDayEnd);
        });
      }
      batch(() => {
        setCountdown((prev) => prev - 1);
        setEndCountdown((prev) => prev - 1);
      });
    }, 1000);
    return () => clearTimeout(id);
  }, [scheduleInfo, daySchedule, userSchedule, countdown, endCountdown, dashboardInfo]);

  const cards = dashboardInfo.map((getter, index) => {
    const { crossSectioned, ...info } = getter(countdown, scheduleInfo, endCountdown);
    const Card = crossSectioned ? CrossSectionedCard : InfoCard;
    return (<Card key={index} {...info} />);
  });
  return (<>{cards}</>);
}
