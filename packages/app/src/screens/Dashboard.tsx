import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';

import authorizedRoute from '../components/common/authorizedRoute';
import Profile from '../components/dashboard/Profile';
import Details from '../components/dashboard/Details';
import Subtext from '../components/common/Subtext';
import Info from '../components/dashboard/Info';
import { TEXT_FONT } from '../constants/style';
import { AppState } from '../types/store';

const Description = styled(Subtext)`
  font-family: ${TEXT_FONT};
`;

export default authorizedRoute('', function Dashboard() {
  const [showingDetails, setShowingDetails] = useState(false);
  const userInfo = useSelector((state: AppState) => state.user);

  const toggleDetails = () => {
    setShowingDetails(!showingDetails);
  };

  const Header = showingDetails && !userInfo.isTeacher ? Details : Profile;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Header userInfo={userInfo} onPress={toggleDetails} />
      <Info />
    </ScrollView>
  );
});
