import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import authorizedRoute from '../components/common/authorizedRoute';
import Profile from '../components/dashboard/Profile';
import Details from '../components/dashboard/Details';
import { AppState } from '../types/store';

export default authorizedRoute('', function Dashboard() {
  const [showingDetails, setShowingDetails] = useState(false);
  const info = useSelector((state: AppState) => state.user);

  const toggleDetails = () => {
    setShowingDetails(!showingDetails);
  };

  const Header = showingDetails && !info.isTeacher ? Details : Profile;

  return (
    <>
      <Header info={info} onPress={toggleDetails} />
    </>
  );
});
