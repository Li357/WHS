import React, { useEffect, useState } from 'react';
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
  const [scheduleInfo, setScheduleInfo] = useState(getScheduleInfoAtTime(now, daySchedule, userSchedule));
  const [countdown, setCountdown] = useState(getCountdown(now, scheduleInfo, daySchedule));
  const [dashboardInfo, setDashboardInfo] = useState(getDashboardInfo(scheduleInfo));

  const dayEnd = daySchedule.slice(-1)[0][1];
  const untilDayEnd = differenceInSeconds(new Date(), convertTimeToDate(dayEnd));
  const [endCountdown, setEndCountdown] = useState(untilDayEnd);

  useEffect(() => {
    if (countdown !== 0) {
      const id: NodeJS.Timeout = setTimeout(() => {
        if (countdown === 0) {
          if (untilDayEnd !== 0) {
            const future = new Date();
            const nextScheduleInfo = getScheduleInfoAtTime(future, daySchedule, userSchedule);
            setScheduleInfo(nextScheduleInfo);
            setCountdown(getCountdown(future, nextScheduleInfo, daySchedule));
            setDashboardInfo(getDashboardInfo(nextScheduleInfo));
          }
          return clearTimeout(id);
        }
        setCountdown((prev) => prev - 1);
        setEndCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(id);
    }
  }, [scheduleInfo, daySchedule, userSchedule, countdown, endCountdown, dashboardInfo]);

  const cards = dashboardInfo.map((getter, index) => {
    const { crossSectioned, ...info } = getter(countdown, scheduleInfo, endCountdown);
    const Card = crossSectioned ? CrossSectionedCard : InfoCard;
    return (<Card key={index} {...info} />);
  });
  return (<>{cards}</>);
}
