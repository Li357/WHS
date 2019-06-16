import styled from 'styled-components/native';

import { SUBTEXT_SIZE, SUBTEXT_FONT } from '../../constants/style';

interface SubtextProps {
  color?: string;
}

export default styled.Text<SubtextProps>`
  color: ${({ theme, color }) => color || theme.subtextColor};
  font-family: ${SUBTEXT_FONT};
  font-size: ${SUBTEXT_SIZE};
`;
