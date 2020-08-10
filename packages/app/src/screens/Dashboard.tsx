import React from 'react';
import { ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import Swiper from 'react-native-swiper';

import authorizedRoute from '../components/common/authorizedRoute';
import Profile from '../components/dashboard/Profile';
import Details from '../components/dashboard/Details';
import Info from '../components/dashboard/Info';
import { AppState, DayScheduleType } from '../types/store';
import { setUserInfo } from '../actions/creators';
import { setProfilePhoto, removeProfilePhoto } from '../utils/manage-photos';
import * as SCHEDULES from '../constants/schedules';
import { reportError, splice } from '../utils/utils';
import { PROFILE_HEIGHT } from '../constants/style';
import { injectAssemblyOrFinalsIfNeeded } from '../utils/process-schedule';
import client from '../utils/bugsnag';
import { getScheduleDay } from '../utils/query-schedule';

const dayScheduleSelector = createSelector(
  ({ day }: AppState) => day.schedule,
  (dayScheduleType: DayScheduleType) => SCHEDULES[dayScheduleType],
);
const scheduleSelector = createSelector(
  ({ user }: AppState) => user.schedule,
  ({ day }: AppState) => day.schedule,
  (schedule, dayScheduleType) => {
    if (['BREAK', 'SUMMER', 'WEEKEND'].includes(dayScheduleType)) {
      return schedule;
    }

    const scheduleDay = getScheduleDay(new Date()); // already returns correct index (not off by one)
    const revisedUserDaySchedule = injectAssemblyOrFinalsIfNeeded(schedule[scheduleDay], dayScheduleType, scheduleDay);
    return splice(schedule, scheduleDay, 1, [revisedUserDaySchedule]);
  },
);
export default authorizedRoute('', function Dashboard({ navigation }) {
  const userInfo = useSelector((state: AppState) => state.user);
  const { accentColor, borderColor } = useSelector((state: AppState) => state.theme);
  const daySchedule = useSelector(dayScheduleSelector);
  const userSchedule = useSelector(scheduleSelector);
  const dispatch = useDispatch();

  const selectPhoto = async (newPhoto: string, base64: boolean = true) => {
    client.leaveBreadcrumb('Selected new profile photo');

    if (newPhoto.length > 0) {
      try {
        const { username } = userInfo;
        const profilePhoto = base64 ? `data:image/jpeg;base64,${newPhoto}` : newPhoto;
        await setProfilePhoto(username, profilePhoto);
        dispatch(setUserInfo({ profilePhoto }));
      } catch (error) {
        reportError(error);
      }
    }
  };

  const resetPhoto = async () => {
    client.leaveBreadcrumb('Resetting profile photo');

    const { username, schoolPicture } = userInfo;
    await selectPhoto(schoolPicture, false);
    await removeProfilePhoto(username);
  };

  const DetailsHeader = <Details userInfo={userInfo} />;
  const ProfileHeader = <Profile userInfo={userInfo} onPhotoSelect={selectPhoto} onPhotoReset={resetPhoto} />;
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Swiper height={PROFILE_HEIGHT} loop={false} activeDotColor={accentColor} dotColor={borderColor}>
        {ProfileHeader}
        {DetailsHeader}
      </Swiper>
      <Info daySchedule={daySchedule} userSchedule={userSchedule} navigation={navigation} />
    </ScrollView>
  );
});
