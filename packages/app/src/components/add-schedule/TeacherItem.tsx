import React from 'react';
import { TouchableOpacityProps } from 'react-native';
import styled from 'styled-components/native';

import { RawTeacherData } from '../../types/schedule';
import {
  FORM_HEIGHT, FORM_PADDING_HORIZONTAL, FORM_BORDER_RADIUS,
  ADD_SCHEDULE_TEACHER_PHOTO_SIZE,
  ADD_SCHEDULE_TEACHER_PHOTO_MARGIN_LEFT,
} from '../../constants/style';
import Avatar from '../common/Avatar';
import Subtext from '../common/Subtext';
import { SCHOOL_PICTURE_BLANK_SYMBOL } from '../../constants/fetch';

const StyledItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  color: ${({ theme }) => theme.textColor};
  background-color: ${({ theme }) => theme.foregroundColor};
  width: 100%;
  height: ${FORM_HEIGHT};
  padding: 0 ${FORM_PADDING_HORIZONTAL};
  border-radius: ${FORM_BORDER_RADIUS};
`;

const AvatarContainer = styled.View`
  flex-basis: ${ADD_SCHEDULE_TEACHER_PHOTO_SIZE};
  height: ${ADD_SCHEDULE_TEACHER_PHOTO_SIZE};
  margin-right: ${ADD_SCHEDULE_TEACHER_PHOTO_MARGIN_LEFT};
`;

interface TeacherItemProps {
  teacher: RawTeacherData;
}

export default function TeacherItem({
  teacher: { firstName, lastName, profilePictureUri },
  ...props
}: TeacherItemProps & TouchableOpacityProps) {
  const source = profilePictureUri !== null ? profilePictureUri : SCHOOL_PICTURE_BLANK_SYMBOL;
  return (
    <StyledItem {...props}>
      <AvatarContainer>
        <Avatar source={source} size={ADD_SCHEDULE_TEACHER_PHOTO_SIZE} />
      </AvatarContainer>
      <Subtext>{firstName} {lastName}</Subtext>
    </StyledItem>
  );
}
