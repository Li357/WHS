import React, { ComponentType } from 'react';
import { NavigationParams, NavigationScreenProps, NavigationDrawerScreenOptions } from 'react-navigation';

import Screen from './Screen';
import Navbar from './Navbar';

type NavigationProps = NavigationScreenProps<NavigationParams, NavigationDrawerScreenOptions>;
type NavigationProp = NavigationProps['navigation'];

export default function authorizedRoute(
  name: string | ((props: NavigationProp) => string),
  Component: ComponentType<{ navigation: NavigationProp}>,
  gutter = true,
) {
  return function AuthorizedRoute(props: NavigationProps) {
    const title = typeof name === 'function' ? name(props.navigation) : name;
    return (
      <>
        <Navbar title={title} {...props} />
        <Screen gutter={gutter}>
          <Component navigation={props.navigation} />
        </Screen>
      </>
    );
  };
}
