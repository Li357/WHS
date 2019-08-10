import React, { ComponentType } from 'react';

import Screen from './Screen';
import Navbar from './Navbar';
import { NavigationProp, NavigationProps } from '../../types/utils';

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
