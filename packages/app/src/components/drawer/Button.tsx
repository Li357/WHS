import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';
import { TouchableOpacityProps } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  FORM_BORDER_RADIUS, FORM_HEIGHT, FORM_PADDING_HORIZONTAL,
  SMALLTEXT_SIZE, BUTTON_MARGIN_VERTICAL,
} from '../../constants/style';
import Subtext from '../common/Subtext';
import { AppState } from '../../types/store';

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
  color: ${({ theme, active }) => active ? theme.backgroundColor : theme.subtextColor};
`;

export interface ButtonProps {
  children: string;
  icon?: string;
  active?: boolean;
}

export default function Button({ children, icon, active = false, ...props }: ButtonProps & TouchableOpacityProps) {
  const theme = useSelector((state: AppState) => state.theme);
  const iconColor = active ? theme.backgroundColor : theme.subtextColor;

  return (
    <ButtonContainer active={active} {...props}>
      <Label active={active}>{children}</Label>
      {icon && <Icon name={icon} size={SMALLTEXT_SIZE} color={iconColor} />}
    </ButtonContainer>
  );
}
