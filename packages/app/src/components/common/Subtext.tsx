import React from 'react';
import { TextProps } from 'react-native';
import styled from 'styled-components/native';

import { SUBTEXT_SIZE, SUBTEXT_FONT } from '../../constants/style';

interface SubtextProps {
  color?: string;
  children: string;
}

const StyledSubtext = styled.Text<SubtextProps>`
  color: ${({ theme, color }) => color || theme.subtextColor};
  font-family: ${SUBTEXT_FONT};
  font-size: ${SUBTEXT_SIZE};
`;

export default function Subtext(props: SubtextProps & TextProps) {
  return (
    <StyledSubtext
      adjustsFontSizeToFit={true}
      numberOfLines={1}
      minimumFontScale={0.5}
      {...props}
    >
      {props.children}
    </StyledSubtext>
  );
}
