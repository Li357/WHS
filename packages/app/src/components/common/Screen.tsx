import styled from 'styled-components/native';

import { SCREEN_MARGIN_HORIZONTAL } from '../../constants/style';

export default styled.View<{ gutter?: boolean }>`
  flex: 1;
  background-color: ${({ theme }) => theme.backgroundColor};
  margin: 0 ${({ gutter = true }) => gutter ? SCREEN_MARGIN_HORIZONTAL : 0};
`;
