import React from 'react';
import styled from 'styled-components/native';
import { NavigationScreenProps, NavigationParams } from 'react-navigation';

import Text from './Text';
import {
  NAVBAR_MARGIN_TOP, NAVBAR_MARGIN_BOTTOM,
  HAMBURGER_WIDTH, HAMBURGER_HEIGHT,
  HAMBURGER_LINE_HEIGHT, HAMBURGER_LINE_BORDER_RADIUS, SCREEN_MARGIN_HORIZONTAL, NAVBAR_TITLE_MARGIN_LEFT,
} from '../../constants/style';

const NavbarContainer = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.backgroundColor};
  padding: ${NAVBAR_MARGIN_TOP} ${SCREEN_MARGIN_HORIZONTAL} ${NAVBAR_MARGIN_BOTTOM};
`;

const HamburgerContainer = styled.TouchableOpacity`
  width: ${HAMBURGER_WIDTH};
  height: ${HAMBURGER_HEIGHT};
  justify-content: space-between;
`;

const One = styled.View`
  height: ${HAMBURGER_LINE_HEIGHT};
  border-radius: ${HAMBURGER_LINE_BORDER_RADIUS};
  background-color: ${({ theme }) => theme.borderColor};
  width: 100%;
`;

const Two = styled(One)`
  width: 70%;
`;

const Three = styled(One)`
  width: 85%;
`;

const Title = styled(Text)`
  flex-shrink: 1;
  margin-left: ${NAVBAR_TITLE_MARGIN_LEFT};
`;

interface NavbarProps {
  title: string;
}

export default function Navbar(props: NavbarProps & NavigationScreenProps<NavigationParams, any>) {
  return (
    <NavbarContainer>
      <HamburgerContainer onPress={props.navigation.openDrawer}>
        <One />
        <Two />
        <Three />
      </HamburgerContainer>
      <Title minimumFontScale={0.25}>{props.title}</Title>
    </NavbarContainer>
  );
}
