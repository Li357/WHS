import { ThunkAction } from 'redux-thunk';
import fetch from 'react-native-fetch-polyfill';

import {
  AppState, SetUserCredentialsAction, SetUserInfoAction, SetUserScheduleAction, SetTeacherSchedulesAction,
} from '../types/store';
import {
  getLoginURL, parseHTMLFromURL, getUserScheduleFromHTML, getUserInfoFromHTML, getLoginError, getSchoolPictureFromHTML,
  fetchTeacherSchedules,
} from '../utils/process-info';
import { getProfilePhoto } from '../utils/manage-photos';
import { setUserInfo, setUserSchedule, setTeacherSchedules, setUserCredentials } from './creators';
import { LoginError } from '../utils/error';
import { FETCH_TIMEOUT } from '../constants/fetch';

export function fetchUserInfo(username: string, password: string) {
  return async function fetchUserInfoThunk(dispatch, getState) {
    const { user } = getState();
    // FIXME: two fetches are needed to clear the current user when another logs in
    // if we are not doing a manual refresh, clear the current user
    const loginURL = getLoginURL(username, password);
    if (username !== user.username) {
      await fetch(loginURL, { method: 'POST', timeout: FETCH_TIMEOUT });
    }

    const $ = await parseHTMLFromURL(loginURL, { method: 'POST' });
    const error = getLoginError($);
    if (error !== '') {
      throw new LoginError(error);
    }

    const schedule = getUserScheduleFromHTML($);
    const info = getUserInfoFromHTML($);
    // prevent profile photo erasure on manual refresh
    const profilePhoto = await getProfilePhoto(username) || info.schoolPicture;
    const refreshedTeacherSchedules = await fetchTeacherSchedules(user.teacherSchedules);

    dispatch(setUserInfo({ ...info, profilePhoto }));
    dispatch(setUserSchedule(schedule));
    dispatch(setTeacherSchedules(refreshedTeacherSchedules));
    dispatch(setUserCredentials({ username, password }));
  } as ThunkAction<
    Promise<void>,
    AppState,
    undefined,
    SetUserCredentialsAction | SetUserInfoAction | SetUserScheduleAction | SetTeacherSchedulesAction
  >;
}

export function fetchSchoolPicture(username: string = '', password: string = '') {
  return async function fetchSchoolPictureThunk(dispatch, getState) {
    const { user } = getState();
    const $ = await parseHTMLFromURL(
      getLoginURL(user.username || username, user.password || password), { method: 'POST' },
    );
    const schoolPicture = getSchoolPictureFromHTML($);
    dispatch(setUserInfo({ schoolPicture }));
  } as ThunkAction<Promise<void>, AppState, undefined, SetUserInfoAction>;
}