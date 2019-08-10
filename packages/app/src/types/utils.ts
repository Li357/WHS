import { NavigationScreenProps, NavigationParams, NavigationDrawerScreenOptions } from 'react-navigation';

export type NavigationProps = NavigationScreenProps<NavigationParams, NavigationDrawerScreenOptions>;
export type NavigationProp = NavigationProps['navigation'];
