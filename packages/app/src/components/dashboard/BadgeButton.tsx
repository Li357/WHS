import React from 'react';
import { TouchableOpacityProps } from 'react-native';
import styled from 'styled-components/native';

import Text from '../common/Text';
import {
  BADGE_BUTTON_PADDING_HORIZONTAL, BADGE_BUTTON_MARGIN_VERTICAL,
  BADGE_BUTTON_HEIGHT, BADGE_BUTTON_RADIUS,
  BADGE_BUTTON_TEXT_SIZE,
} from '../../constants/style';

const ButtonContainer = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.accentColor};
  justify-content: center;
  align-items: center;
  align-self: flex-start;
  padding: 0 ${BADGE_BUTTON_PADDING_HORIZONTAL};
  margin: ${BADGE_BUTTON_MARGIN_VERTICAL} 0;
  height: ${BADGE_BUTTON_HEIGHT};
  border-radius: ${BADGE_BUTTON_RADIUS};
`;

const Label = styled(Text)`
  font-size: ${BADGE_BUTTON_TEXT_SIZE};
  color: ${({ theme }) => theme.backgroundColor};
`;

interface BadgeButtonProps {
  children: string;
}

export default function BadgeButton({ children, ...props }: BadgeButtonProps & TouchableOpacityProps) {
  return (
    <ButtonContainer {...props}>
      <Label>{children}</Label>
    </ButtonContainer>
  );
}
