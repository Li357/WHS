import React from 'react';
import styled from 'styled-components/native';
import PhotoUpload from 'react-native-photo-upload';

import Text from '../common/Text';
import { UserInfo } from '../../types/store';
import { PROFILE_HEIGHT } from '../../constants/style';
import { SCHOOL_PICTURE_BLANK_SYMBOL } from '../../constants/fetch';
import BlankUser from '../../../assets/images/blank-user.png';

const ProfileContainer = styled.View`
  height: ${PROFILE_HEIGHT};
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
`;

const ProfileImage = styled.Image`

`;

interface ProfileProps {
  info: UserInfo;
  onDetailsPress: () => void;
}

export default function Profile({ info, onDetailsPress }: ProfileProps) {
  const { name, classOf, profilePhoto, schoolPicture } = info;

  const photoSource = profilePhoto === SCHOOL_PICTURE_BLANK_SYMBOL ? BlankUser : BlankUser;//{ uri: profilePhoto };

  return (
    <ProfileContainer>
      <PhotoUpload>
        <ProfileImage source={photoSource} />
      </PhotoUpload>
      <Text>YE</Text>
    </ProfileContainer>
  );
}
