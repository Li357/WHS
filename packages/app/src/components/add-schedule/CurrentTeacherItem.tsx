import React from 'react';
import { TouchableOpacityProps, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import Subtext from '../common/Subtext';
import {
  FORM_HEIGHT, FORM_PADDING_HORIZONTAL, FORM_BORDER_RADIUS,
  ADD_SCHEDULE_TEACHER_PHOTO_SIZE,
} from '../../constants/style';
import { AppState } from '../../types/store';

const StyledItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.textColor};
  background-color: ${({ theme }) => theme.foregroundColor};
  width: 100%;
  height: ${FORM_HEIGHT};
  padding: 0 ${FORM_PADDING_HORIZONTAL};
  border-radius: ${FORM_BORDER_RADIUS};
`;

interface CurrentTeacherItemProps {
  name: string;
}

export default function CurrentTeacherItem({ name, ...props }: CurrentTeacherItemProps & TouchableOpacityProps) {
  const theme = useSelector((state: AppState) => state.theme);
  return (
    <StyledItem>
      <Subtext>{name}</Subtext>
      <TouchableOpacity {...props}>
        <Icon name="clear" size={ADD_SCHEDULE_TEACHER_PHOTO_SIZE} color={theme.subtextColor} />
      </TouchableOpacity>
    </StyledItem>
  );
}
