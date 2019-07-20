import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';

import authorizedRoute from '../components/common/authorizedRoute';
import Profile from '../components/dashboard/Profile';
import Details from '../components/dashboard/Details';
import Info from '../components/dashboard/Info';
import { AppState, DayScheduleType } from '../types/store';
import { setUserInfo } from '../actions/creators';
import { setProfilePhoto, removeProfilePhoto } from '../utils/manage-photos';
import * as SCHEDULES from '../constants/schedules';

const dayScheduleSelector = createSelector(
  ({ day }: AppState) => day.schedule,
  (dayScheduleType: DayScheduleType) => SCHEDULES[dayScheduleType],
);
export default authorizedRoute('', function Dashboard() {
  const [showingDetails, setShowingDetails] = useState(false);
  const userInfo = useSelector((state: AppState) => state.user);
  const daySchedule = useSelector(dayScheduleSelector);
  const dispatch = useDispatch();

  const toggleDetails = () => {
    setShowingDetails(!showingDetails);
  };

  const selectPhoto = async (newPhoto: string, base64: boolean = true) => {
    if (newPhoto.length > 0) {
      try {
        const { username } = userInfo;
        const profilePhoto = base64 ? `data:image/jpeg;base64,${newPhoto}` : newPhoto;
        await setProfilePhoto(username, profilePhoto);
        dispatch(setUserInfo({ profilePhoto }));
      } catch (error) {
        // TODO: Report error
      }
    }
  };

  const resetPhoto = async () => {
    const { username, schoolPicture } = userInfo;
    await selectPhoto(schoolPicture, false);
    await removeProfilePhoto(username);
  };

  const DetailsHeader = (<Details userInfo={userInfo} onPress={toggleDetails} />);
  const ProfileHeader = (
    <Profile userInfo={userInfo} onPress={toggleDetails} onPhotoSelect={selectPhoto} onPhotoReset={resetPhoto} />
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {showingDetails && !userInfo.isTeacher ? DetailsHeader : ProfileHeader}
      <Info daySchedule={daySchedule} userSchedule={userInfo.schedule} />
    </ScrollView>
  );
});
