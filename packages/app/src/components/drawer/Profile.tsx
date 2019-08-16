import React from 'react';
import styled from 'styled-components/native';

import {
  DRAWER_INFO_MARGIN_TOP, DRAWER_INFO_MARGIN_BOTTOM, DRAWER_INFO_IMAGE_SIZE,
  SMALLTEXT_SIZE, SUBTEXT_SIZE,
  PROFILE_INFO_MARGIN_LEFT,
} from '../../constants/style';
import { UserState } from '../../types/store';
import Avatar from '../common/Avatar';
import Text from '../common/Text';
import Subtext from '../common/Subtext';

const ProfileContainer = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: stretch;
  margin: ${DRAWER_INFO_MARGIN_TOP} 0 ${DRAWER_INFO_MARGIN_BOTTOM};
`;

const ImageContainer = styled.View`
  flex-basis: ${DRAWER_INFO_IMAGE_SIZE};
  height: ${DRAWER_INFO_IMAGE_SIZE};
`;

const RightContainer = styled.View`
  flex-shrink: 1;
  margin-left: ${PROFILE_INFO_MARGIN_LEFT};
`;

const Title = styled(Text)`
  font-size: ${SUBTEXT_SIZE};
`;

const BodyText = styled(Subtext)`
  font-size: ${SMALLTEXT_SIZE};
`;

interface ProfileProps {
  userInfo: UserState;
}

export default function Profile({ userInfo: { profilePhoto, name, id, isTeacher } }: ProfileProps) {
  return (
    <ProfileContainer>
      <ImageContainer><Avatar source={profilePhoto} size={DRAWER_INFO_IMAGE_SIZE} /></ImageContainer>
      <RightContainer>
        <Title>{name}</Title>
        {!isTeacher && <BodyText>ID: {id!}</BodyText>}
      </RightContainer>
    </ProfileContainer>
  );
}
