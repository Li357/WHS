import React from 'react';
import { TextInputProps } from 'react-native';
import styled from 'styled-components/native';

import {
  SUBTEXT_SIZE, SUBTEXT_FONT,
  FORM_HEIGHT, FORM_BORDER_RADIUS, FORM_PADDING_HORIZONTAL, INPUT_BORDER_WIDTH, FORM_MARGIN_VERTICAL,
} from '../../constants/style';

interface InputProps {
  error: boolean;
}

const StyledInput = styled.TextInput<InputProps>`
  color: ${({ theme }) => theme.textColor};
  font-family: ${SUBTEXT_FONT};
  font-size: ${SUBTEXT_SIZE};
  border-color: ${({ theme, error }) => error ? theme.accentColor : 'transparent'};
  border-width: ${INPUT_BORDER_WIDTH};
  border-radius: ${FORM_BORDER_RADIUS};
  background-color: ${({ theme }) => theme.foregroundColor};
  width: 100%;
  height: ${FORM_HEIGHT};
  padding: 0 ${FORM_PADDING_HORIZONTAL};
  margin: ${FORM_MARGIN_VERTICAL} 0;
`;

export default function Input(props: InputProps & TextInputProps) {
  return (<StyledInput autoCorrect={false} autoCapitalize="none" {...props} />);
}
