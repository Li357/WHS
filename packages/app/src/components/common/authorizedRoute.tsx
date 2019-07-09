import React, { ComponentType } from 'react';
import { NavigationParams, NavigationScreenProps, NavigationDrawerScreenOptions } from 'react-navigation';

import Screen from './Screen';
import Navbar from './Navbar';

export default function authorizedRoute(name: string, Component: ComponentType) {
  return function AuthorizedRoute(props: NavigationScreenProps<NavigationParams, NavigationDrawerScreenOptions>) {
    return (
      <Screen>
        <Navbar title={name} {...props} />
        <Component />
      </Screen>
    );
  };
}
