import React, { useState } from 'react';
import { Switch as RNSwitch } from 'react-native';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';

import {
  FORM_BORDER_RADIUS, FORM_HEIGHT, FORM_PADDING_HORIZONTAL,
  SMALLTEXT_SIZE, BUTTON_MARGIN_VERTICAL,
} from '../../constants/style';
import Subtext from '../common/Subtext';
import { AppState } from '../../types/store';

const SwitchContainer = styled.View`
  flex-direction: row;
  border-radius: ${FORM_BORDER_RADIUS};
  background-color: ${({ theme }) => theme.foregroundColor};
  width: 100%;
  height: ${FORM_HEIGHT};
  margin: ${BUTTON_MARGIN_VERTICAL} 0;
  padding: 0 ${FORM_PADDING_HORIZONTAL};
  justify-content: space-between;
  align-items: center;
`;

const Label = styled(Subtext)`
  font-size: ${SMALLTEXT_SIZE};
  color: ${({ theme }) => theme.subtextColor};
`;

export interface SwitchProps {
  children: string;
  value: boolean;
  onChange: (newVal: boolean) => void;
}

export default function Switch({ children, onChange, value }: SwitchProps) {
  const { accentColor, backgroundColor } = useSelector((state: AppState) => state.theme);
  return (
    <SwitchContainer>
      <Label>{children}</Label>
      <RNSwitch
        value={value}
        onValueChange={onChange}
        ios_backgroundColor={value ? accentColor : backgroundColor}
        trackColor={{ true: accentColor }}
      />
    </SwitchContainer>
  );
}
