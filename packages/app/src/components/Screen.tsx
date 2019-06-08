import styled from 'styled-components/native';

import { SCREEN_PADDING_HORIZONTAL, SCREEN_PADDING_TOP } from '../constants/style';

export default styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.backgroundColor};
  padding: ${SCREEN_PADDING_TOP} ${SCREEN_PADDING_HORIZONTAL} 0;
`;
