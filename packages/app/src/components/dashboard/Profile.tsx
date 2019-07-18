import React, { memo } from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import PhotoUpload from 'react-native-photo-upload';

import Text from '../common/Text';
import { UserInfo } from '../../types/store';
import { SCHOOL_PICTURE_BLANK_SYMBOL } from '../../constants/fetch';
import {
  PROFILE_INFO_MARGIN_LEFT,
  PROFILE_PHOTO_SIZE, PROFILE_PHOTO_BORDER_RADIUS,
  PROFILE_MARGIN_BOTTOM,
} from '../../constants/style';
import BlankUser from '../../../assets/images/blank-user.png';
import Subtext from '../common/Subtext';
import BadgeButton from './BadgeButton';

const ProfileContainer = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: stretch;
  margin-bottom: ${PROFILE_MARGIN_BOTTOM};
`;

const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: ${PROFILE_PHOTO_BORDER_RADIUS};
`;

const RightContainer = styled.View`
  height: ${PROFILE_PHOTO_SIZE};
  flex-grow: 1;
  flex-shrink: 1;
  justify-content: space-between;
  margin-left: ${PROFILE_INFO_MARGIN_LEFT};
`;

const photoContainerStyle = {
  flexBasis: PROFILE_PHOTO_SIZE,
  height: PROFILE_PHOTO_SIZE,
};

interface ProfileProps {
  userInfo: UserInfo;
  onPress: () => void;
  onPhotoReset: () => void;
  onPhotoSelect: (newPhoto: string) => void;
}

export default memo(function Profile({ userInfo, onPress, onPhotoReset, onPhotoSelect }: ProfileProps) {
  const { name, classOf, profilePhoto } = userInfo;

  // shows blank user if user does not have school picture yet
  const photoSource = profilePhoto === SCHOOL_PICTURE_BLANK_SYMBOL ? BlankUser : { uri: profilePhoto };
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
        <ProfileImage source={photoSource} />
      </PhotoUpload>
      <RightContainer>
        <View>
          <Text adjustsFontSizeToFit={true} numberOfLines={1}>{name}</Text>
          <Subtext>{classOf}</Subtext>
        </View>
        <BadgeButton onPress={onPress}>DETAILS</BadgeButton>
      </RightContainer>
    </ProfileContainer>
  );
});
