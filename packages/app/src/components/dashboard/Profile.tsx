import React, { memo } from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import PhotoUpload from 'react-native-photo-upload';

import Text from '../common/Text';
import { UserInfo } from '../../types/store';
import { PROFILE_INFO_MARGIN_LEFT, PROFILE_PHOTO_SIZE, PROFILE_MARGIN_BOTTOM } from '../../constants/style';
import Subtext from '../common/Subtext';
import Avatar from '../common/Avatar';

const ProfileContainer = styled.View`
  flex: 1;
  width: 100%;
  flex-direction: row;
  align-items: stretch;
  margin-bottom: ${PROFILE_MARGIN_BOTTOM};
`;

const RightContainer = styled.View`
  flex-grow: 1;
  flex-shrink: 1;
  margin-left: ${PROFILE_INFO_MARGIN_LEFT};
`;

const photoContainerStyle = {
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: PROFILE_PHOTO_SIZE,
  height: PROFILE_PHOTO_SIZE,
};

interface ProfileProps {
  userInfo: UserInfo;
  onPhotoReset: () => void;
  onPhotoSelect: (newPhoto: string) => void;
}

export default memo(function Profile({ userInfo, onPhotoReset, onPhotoSelect }: ProfileProps) {
  const { name, classOf, profilePhoto } = userInfo;

  const customButtons = [{ name: 'RESET', title: 'Reset Photo' }];
  const photoResetHandler = (buttonName: string) => {
    if (buttonName === 'RESET') {
      onPhotoReset();
    }
  };

  return (
    <ProfileContainer>
      <PhotoUpload
        containerStyle={photoContainerStyle}
        imagePickerProps={{ customButtons }}
        onTapCustomButton={photoResetHandler}
        onPhotoSelect={onPhotoSelect}
      >
        <Avatar source={profilePhoto} size={PROFILE_PHOTO_SIZE} />
      </PhotoUpload>
      <RightContainer>
        <Text>{name}</Text>
        <Subtext>{classOf}</Subtext>
      </RightContainer>
    </ProfileContainer>
  );
});
