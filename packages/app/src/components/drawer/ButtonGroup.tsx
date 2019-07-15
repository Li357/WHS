import React, { ReactElement } from 'react';
import styled from 'styled-components/native';

import { FORM_BORDER_RADIUS, FORM_MARGIN_VERTICAL } from '../../constants/style';
import Button, { ButtonProps } from './Button';

const Container = styled.View`
  border-radius: ${FORM_BORDER_RADIUS};
  background-color: ${({ theme }) => theme.foregroundColor};
  margin: ${FORM_MARGIN_VERTICAL} 0;
`;

const ButtonWithoutMargin = styled(Button)`
  margin: 0;
`;

interface ButtonGroupProps {
  activeIndex: number;
  children: Array<ReactElement<ButtonProps, typeof Button>>;
}

export default function ButtonGroup(props: ButtonGroupProps) {
  const children = React.Children.map(props.children, (child, index) => {
    const withActive = { ...child.props, active: index === props.activeIndex };
    return (<ButtonWithoutMargin {...withActive}>{withActive.children}</ButtonWithoutMargin>);
  });

  return (<Container>{children}</Container>);
}
