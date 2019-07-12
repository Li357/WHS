import React from 'react';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native';

import { DRAWER_MARGIN_HORIZONTAL } from '../../constants/style';
import Profile from './Profile';
import Button from './Button';

const DrawerContainer = styled.View`
  flex: 1;
  margin: 0 ${DRAWER_MARGIN_HORIZONTAL};
`;

export default function Drawer() {
  return (
    <DrawerContainer>
      <ScrollView>
        <Profile />
        <Button active={true} icon="dashboard">Dashboard</Button>
        <Button active={false} icon="schedule">Schedule</Button>
        <Button active={false} icon="settings">Settings</Button>
        <Button active={false} icon="chevron-right">Logout</Button>
      </ScrollView>
    </DrawerContainer>
  );
}
