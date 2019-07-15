import React, { useEffect, useState } from 'react';

import { ModNumber } from '../../types/schedule';
import { getModAtTime } from '../../utils/query-schedule';

export default function Info() {
  const now = new Date();
  const daySchedule 
  const [currentMod, setCurrentMod] = useState(getModAtTime(now));
  const [countdown, setCountdown] = useState(getCountdown(now));

  useEffect(() => {
    const id = setInterval(() => {
      if (countdown === 0) {
        const future = new Date();
        setCurrentMod(getCurrentMod(future));
        setCountdown(getCountdown(future));
      }

      setCountdown(countdown - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [currentMod]);

  return null;
}
