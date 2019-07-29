import React, { ReactNode } from 'react';
import { TouchableOpacityProps } from 'react-native';
import styled from 'styled-components/native';

import { FORM_HEIGHT, FORM_BORDER_RADIUS, FORM_MARGIN_VERTICAL } from '../../constants/style';
import Subtext from './Subtext';

const ButtonContainer = styled.TouchableOpacity`
  border-radius: ${FORM_BORDER_RADIUS};
  background-color: ${({ theme, disabled }) => disabled ? theme.borderColor : theme.accentColor};
  width: 100%;
  height: ${FORM_HEIGHT};
  margin: ${FORM_MARGIN_VERTICAL} 0;
  justify-content: center;
  align-items: center;
`;

const Label = styled(Subtext)`
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.backgroundColor};
`;

interface ButtonProps {
  children: ReactNode;
}

export default function Button({ children, ...props }: ButtonProps & TouchableOpacityProps) {
  return (
    <ButtonContainer {...props}>
      {typeof children === 'string' ? <Label>{children}</Label> : children}
    </ButtonContainer>
  );
}
