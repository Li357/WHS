import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';

import authorizedRoute from '../components/common/authorizedRoute';
import Text from '../components/common/Text';
import Profile from '../components/dashboard/Profile';
import Details from '../components/dashboard/Details';
import Card from '../components/dashboard/Card';
import { AppState } from '../types/store';
import Subtext from '../components/common/Subtext';
import { TEXT_FONT, PROFILE_MARGIN_BOTTOM } from '../constants/style';

const Description = styled(Subtext)`
  font-family: ${TEXT_FONT};
`;

export default authorizedRoute('', function Dashboard() {
  const [showingDetails, setShowingDetails] = useState(false);
  const info = useSelector((state: AppState) => state.user);

  const toggleDetails = () => {
    setShowingDetails(!showingDetails);
  };

  const Header = showingDetails && !info.isTeacher ? Details : Profile;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Header info={info} onPress={toggleDetails} />
      <Card title="next mod">
        <Text>14</Text>
      </Card>
      <Card title="until next mod">
        <Text>25:13</Text>
      </Card>
      <Card title="next class">
        <Text>AP US History</Text>
        <Description>Room 351 (Kleinsasser)</Description>
      </Card>
      <Card title="until next mod">
        <Text>25:13</Text>
      </Card>
    </ScrollView>
  );
});
