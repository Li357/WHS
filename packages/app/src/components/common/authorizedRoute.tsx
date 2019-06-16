import React, { ComponentType } from 'react';
import { NavigationScreenConfigProps } from 'react-navigation';

import Screen from './Screen';
import Navbar from './Navbar';

export default function authorizedRoute(Component: ComponentType) {
  return function AuthorizedRoute(props: NavigationScreenConfigProps) {
    // TODO: Add title to navbar
    return (
      <Screen>
        <Navbar title="Dashboard" {...props} />
        <Component />
      </Screen>
    );
  };
}
