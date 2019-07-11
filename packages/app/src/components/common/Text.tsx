import React from 'react';
import { TextProps } from 'react-native';
import styled from 'styled-components/native';

import { TEXT_SIZE, TEXT_FONT } from '../../constants/style';

interface StyledTextProps {
  color?: string;
  children: string;
}

const StyledText = styled.Text<StyledTextProps>`
  color: ${({ theme, color }) => color || theme.textColor};
  font-family: ${TEXT_FONT};
  font-size: ${TEXT_SIZE};
`;

export default function Text(props: StyledTextProps & TextProps) {
  return (
    <StyledText
      adjustsFontSizeToFit={true}
      numberOfLines={1}
      minimumFontScale={0.75}
      {...props}
    >
      {props.children}
    </StyledText>
  );
}
