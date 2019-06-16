import styled from 'styled-components/native';

import { TEXT_SIZE, TEXT_FONT } from '../../constants/style';

interface TextProps {
  color?: string;
}

export default styled.Text<TextProps>`
  color: ${({ theme, color }) => color || theme.textColor};
  font-family: ${TEXT_FONT};
  font-size: ${TEXT_SIZE};
`;
