import 'styled-components'

import { ThemeState } from '../store';

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeState {}
}
