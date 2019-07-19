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
  // TODO: add AppState event listeners
  const now = new Date();
  const [scheduleInfo, setScheduleInfo] = useState(() => getScheduleInfoAtTime(now, daySchedule, userSchedule));
  const [countdown, setCountdown] = useState(() => getCountdown(now, scheduleInfo, daySchedule));
  const [dashboardInfo, setDashboardInfo] = useState(() => getDashboardInfo(daySchedule, userSchedule, scheduleInfo));

  const dayEnd = daySchedule.slice(-1)[0][1];
  const [endCountdown, setEndCountdown] = useState(() => (
    Math.max(-1, differenceInSeconds(convertTimeToDate(dayEnd), now))
  ));
  const [finished, setFinished] = useState(endCountdown === 0);

  useEffect(() => {
    if (!finished) {
      // updating countdown causes timeout to be reset, i.e. an interval
      const id: NodeJS.Timeout = setTimeout(() => {
        if (countdown === 0) {
          const future = new Date();
          const nextScheduleInfo = getScheduleInfoAtTime(future, daySchedule, userSchedule);
          // Recompute to stay consistent with other countdowns
          const untilDayEnd = differenceInSeconds(convertTimeToDate(dayEnd), future);

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
  }, [scheduleInfo, daySchedule, userSchedule, countdown, endCountdown, dashboardInfo]);

  const cards = dashboardInfo.map((getter, index) => {
    const { crossSectioned, ...info } = getter(countdown, scheduleInfo, endCountdown);
    const Card = crossSectioned ? CrossSectionedCard : InfoCard;
    return (<Card key={index} {...info} />);
  });
  return (<>{cards}</>);
}
