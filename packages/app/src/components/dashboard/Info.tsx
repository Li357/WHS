import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';

import { getCountdown, getScheduleInfoAtTime } from '../../utils/query-schedule';
import { getDashboardInfo } from '../../utils/dashboard-info';
import Card from './Card';
import Text from '../common/Text';
import Subtext from '../common/Subtext';
import { DaySchedule, Schedule } from '../../types/schedule';

const Description = styled(Subtext)`
  color: ${({ theme }) => theme.textColor};
`;

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
    const { title, subtitle, name } = getter(countdown, scheduleInfo);
    // TODO: Finish case for cross-sectioned classes
    return (
      <Card key={index}>
        <Text numberOfLines={2}>{title}</Text>
        {subtitle && <Description>{subtitle}</Description>}
        {name && <Subtext>{name}</Subtext>}
      </Card>
    );
  });
  return (<>{cards}</>);
}
