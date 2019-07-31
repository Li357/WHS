import React, { ReactNode } from 'react';
import styled from 'styled-components/native';
import { TouchableOpacityProps } from 'react-native';

import {
  FORM_BORDER_RADIUS, FORM_HEIGHT, FORM_PADDING_HORIZONTAL,
  SMALLTEXT_SIZE, BUTTON_MARGIN_VERTICAL, INPUT_ACTIVE_COLOR,
} from '../../constants/style';
import Subtext from '../common/Subtext';

const ButtonContainer = styled.TouchableOpacity<{ active: boolean }>`
  flex-direction: row;
  border-radius: ${FORM_BORDER_RADIUS};
  background-color: ${({ theme, active }) => active ? theme.accentColor : theme.foregroundColor};
  width: 100%;
  height: ${FORM_HEIGHT};
  margin: ${BUTTON_MARGIN_VERTICAL} 0;
  padding: 0 ${FORM_PADDING_HORIZONTAL};
  justify-content: space-between;
  align-items: center;
`;

const Label = styled(Subtext)<{ active: boolean }>`
  font-size: ${SMALLTEXT_SIZE};
  color: ${({ theme, active }) => active ? INPUT_ACTIVE_COLOR : theme.subtextColor};
`;

export interface ButtonProps {
  children: string;
  active?: boolean;
  left?: ReactNode;
}

export default function Button({ children, left, active = false, ...props }: ButtonProps & TouchableOpacityProps) {
  return (
    <ButtonContainer active={active} {...props}>
      <Label active={active}>{children}</Label>
      {left}
    </ButtonContainer>
  );
}
