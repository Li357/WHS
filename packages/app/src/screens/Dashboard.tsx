import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSelector } from 'react-redux';

import authorizedRoute from '../components/common/authorizedRoute';
import Profile from '../components/dashboard/Profile';
import Details from '../components/dashboard/Details';
import Info from '../components/dashboard/Info';
import { AppState } from '../types/store';

export default authorizedRoute('', function Dashboard() {
  const [showingDetails, setShowingDetails] = useState(false);
  const userInfo = useSelector((state: AppState) => state.user);
  const daySchedule = useSelector(({ day }: AppState) => day.schedule);

  const toggleDetails = () => {
    setShowingDetails(!showingDetails);
  };

  const Header = showingDetails && !userInfo.isTeacher ? Details : Profile;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Header userInfo={userInfo} onPress={toggleDetails} />
      <Info daySchedule={daySchedule} userSchedule={userInfo.schedule} />
    </ScrollView>
  );
});
