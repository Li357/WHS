import React from 'react';
import { TextInputProps } from 'react-native';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';

import {
  SUBTEXT_SIZE, SUBTEXT_FONT,
  FORM_HEIGHT, FORM_BORDER_RADIUS, FORM_PADDING_HORIZONTAL, INPUT_BORDER_WIDTH, FORM_MARGIN_VERTICAL,
} from '../../constants/style';
import { AppState } from '../../types/store';

const StyledInput = styled.TextInput<InputProps>`
  color: ${({ theme }) => theme.textColor};
  font-family: ${SUBTEXT_FONT};
  font-size: ${SUBTEXT_SIZE};
  border-color: ${({ theme, error = false }) => error ? theme.accentColor : 'transparent'};
  border-width: ${INPUT_BORDER_WIDTH};
  border-radius: ${FORM_BORDER_RADIUS};
  background-color: ${({ theme }) => theme.foregroundColor};
  width: 100%;
  height: ${FORM_HEIGHT};
  padding: 0 ${FORM_PADDING_HORIZONTAL};
  margin: ${FORM_MARGIN_VERTICAL} 0;
`;

interface InputProps {
  error?: boolean;
}

export default function Input(props: InputProps & TextInputProps) {
  const theme = useSelector((state: AppState) => state.theme);
  return (<StyledInput selectionColor={theme.accentColor} autoCorrect={false} autoCapitalize="none" {...props} />);
}
