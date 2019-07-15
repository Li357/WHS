import { ThunkAction } from 'redux-thunk';
import fetch from 'react-native-fetch-polyfill';

import {
  AppState,
  SetUserCredentialsAction, SetUserInfoAction, SetUserScheduleAction, SetTeacherSchedulesAction,
  SetDayInfoAction,
} from '../types/store';
import {
  getLoginURL, parseHTMLFromURL, getUserScheduleFromHTML, getUserInfoFromHTML, getLoginError, getSchoolPictureFromHTML,
  fetchTeacherSchedules,
} from '../utils/process-info';
import { getProfilePhoto, setProfilePhoto } from '../utils/manage-photos';
import { setUserInfo, setUserSchedule, setTeacherSchedules, setUserCredentials } from './creators';
import { LoginError } from '../utils/error';
import { FETCH_TIMEOUT } from '../constants/fetch';

export function fetchUserInfo(username: string, password: string) {
  const fetchUserInfoThunk: ThunkAction<
    Promise<void>,
    AppState,
    undefined,
    SetUserCredentialsAction | SetUserInfoAction | SetUserScheduleAction | SetTeacherSchedulesAction
  > = async (dispatch, getState) => {
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
    await setProfilePhoto(username, profilePhoto);
    const refreshedTeacherSchedules = await fetchTeacherSchedules(user.teacherSchedules);

    dispatch(setUserInfo({ ...info, profilePhoto }));
    dispatch(setUserSchedule(schedule));
    dispatch(setTeacherSchedules(refreshedTeacherSchedules));
    dispatch(setUserCredentials({ username, password }));
  };
  return fetchUserInfoThunk;
}

export function fetchSchoolPicture(username: string = '', password: string = '') {
  const fetchSchoolPictureThunk: ThunkAction<
    Promise<void>,
    AppState,
    undefined,
    SetUserInfoAction
  > = async (dispatch, getState) => {
    const { user } = getState();
    const $ = await parseHTMLFromURL(
      getLoginURL(user.username || username, user.password || password), { method: 'POST' },
    );
    const schoolPicture = getSchoolPictureFromHTML($);
    dispatch(setUserInfo({ schoolPicture }));
  };
  return fetchSchoolPictureThunk;
}

export function fetchDates(year: number, type: ) {
  const fetchDatesThunk: ThunkAction<
    Promise<void>,
    AppState,
    undefined,
    SetDayInfoAction
  > = async (dispatch, getState) => {

  }
  return fetchDatesThunk;
}
