import React, { useEffect, useState } from 'react';

import { getCountdown, getScheduleInfoAtTime } from '../../utils/query-schedule';
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

  useEffect(() => {
    if (countdown !== 0) {
      const id = setInterval(() => {
        if (countdown === 0) {
          const future = new Date();
          const nextScheduleInfo = getScheduleInfoAtTime(future, daySchedule, userSchedule);
          setScheduleInfo(nextScheduleInfo);
          setCountdown(getCountdown(future, nextScheduleInfo, daySchedule));
          setDashboardInfo(getDashboardInfo(nextScheduleInfo));
          return;
        }
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(id);
    }
  }, [scheduleInfo, daySchedule, userSchedule, countdown, dashboardInfo]);

  const cards = dashboardInfo.map((getter, index) => {
    const { crossSectioned, ...info } = getter(countdown, scheduleInfo);
    const Card = crossSectioned ? CrossSectionedCard : InfoCard;
    return (<Card key={index} {...info} />);
  });
  return (<>{cards}</>);
}
