import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import authorizedRoute from '../components/common/authorizedRoute';
import Profile from '../components/dashboard/Profile';
import { AppState } from '../types/store';

export default authorizedRoute(function Dashboard() {
  const showingDetails = useState(false);
  const info = useSelector((state: AppState) => state.user);

  return (
    <>
      <Profile info={info} />
    </>
  );
});
