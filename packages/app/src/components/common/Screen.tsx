import styled from 'styled-components/native';

import { SCREEN_MARGIN_HORIZONTAL } from '../../constants/style';

export default styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.backgroundColor};
  margin: 0 ${SCREEN_MARGIN_HORIZONTAL};
`;
