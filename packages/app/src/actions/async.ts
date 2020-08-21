import { ThunkAction } from 'redux-thunk';
import { isAfter } from 'date-fns';

import {
  AppState,
  SetUserCredentialsAction,
  SetUserInfoAction,
  SetUserScheduleAction,
  SetTeacherSchedulesAction,
  SetDatesAction,
  SetRefreshedAction,
  DatesState,
  ELearningPlansState,
  SetELearningPlansAction,
} from '../types/store';
import { fetch } from '../utils/utils';
import {
  getLoginURL,
  parseHTMLFromURL,
  getUserScheduleFromHTML,
  getUserInfoFromHTML,
  getLoginError,
  getSchoolPictureFromHTML,
  getTeacherSchedules,
  getDates,
  getELearningPlans,
} from '../utils/process-info';
import { getProfilePhoto, setProfilePhoto } from '../utils/manage-photos';
import { setUserInfo, setUserSchedule, setTeacherSchedules, setUserCredentials, setDates, setRefreshed, setELearningPlans } from './creators';
import { LoginError } from '../utils/error';
import { FETCH_TIMEOUT, DATE_TYPES, SETTING_TYPES } from '../constants/fetch';
import { getSchoolYearFromDate } from '../utils/query-schedule';

export function fetchUserInfo(username: string, password: string) {
  const fetchUserInfoThunk: ThunkAction<
    Promise<void>,
    AppState,
    undefined,
    SetUserCredentialsAction | SetUserInfoAction | SetUserScheduleAction | SetTeacherSchedulesAction | SetRefreshedAction
  > = async (dispatch, getState) => {
    const {
      user,
      dates: { semesterOneStart, semesterTwoStart, semesterTwoEnd },
      day: { refreshedSemesterOne, refreshedSemesterTwo },
    } = getState();
    // FIXME: two fetches are needed to clear the current user when another logs in
    // if we are not doing a manual refresh, clear the current user
    const loginURL = getLoginURL(username, password);
    if (username !== user.username) {
      // In the future, refactor so all direct fetch calls are abstracted away
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
    const profilePhoto = (await getProfilePhoto(username)) || info.schoolPicture;
    await setProfilePhoto(username, profilePhoto);
    const refreshedTeacherSchedules = await getTeacherSchedules(user.teacherSchedules);

    if (semesterOneStart !== null && semesterTwoStart !== null && semesterTwoEnd !== null) {
      const now = new Date();
      if (isAfter(now, semesterTwoEnd)) {
        dispatch(setRefreshed([false, false]));
      } else if (isAfter(now, semesterTwoStart) && !refreshedSemesterTwo) {
        dispatch(setRefreshed([true, true]));
      } else if (isAfter(now, semesterOneStart) && !refreshedSemesterOne) {
        dispatch(setRefreshed([true, false]));
      }
    }

    dispatch(setUserInfo({ ...info, profilePhoto }));
    dispatch(setUserSchedule(schedule));
    dispatch(setTeacherSchedules(refreshedTeacherSchedules));
    dispatch(setUserCredentials({ username, password }));
  };
  return fetchUserInfoThunk;
}

export function fetchSchoolPicture(username: string = '', password: string = '') {
  const fetchSchoolPictureThunk: ThunkAction<Promise<string>, AppState, undefined, SetUserInfoAction> = async (dispatch, getState) => {
    const { user } = getState();
    const $ = await parseHTMLFromURL(getLoginURL(user.username || username, user.password || password), { method: 'POST' });
    const schoolPicture = getSchoolPictureFromHTML($);
    dispatch(setUserInfo({ schoolPicture }));
    return schoolPicture;
  };
  return fetchSchoolPictureThunk;
}

export function fetchDates(year?: number) {
  const fetchDatesThunk: ThunkAction<Promise<DatesState>, AppState, undefined, SetDatesAction> = async (dispatch) => {
    if (!year) {
      year = getSchoolYearFromDate(new Date());
    }
    const [assembly, noSchool, earlyDismissal, lateStart, wednesday] = await Promise.all(
      DATE_TYPES.map(async (type) => {
        const dates = await getDates(type, year!);
        return dates.map((dateObj) => {
          const date = new Date(dateObj.date);
          // guarantee comparison wrt only day
          date.setHours(0, 0, 0, 0);
          return date;
        });
      }),
    );
    const [semesterOneStart, semesterOneEnd, semesterTwoStart, semesterTwoEnd] = await Promise.all(
      SETTING_TYPES.map(async (type) => {
        const [setting] = await getDates(type, year!);
        if (setting) {
          const date = new Date(setting.date);
          date.setHours(0, 0, 0, 0);
          return date;
        }
        return null;
      }),
    );
    const datesState = {
      assembly,
      noSchool,
      earlyDismissal,
      lateStart,
      wednesday,
      semesterOneStart,
      semesterOneEnd,
      semesterTwoStart,
      semesterTwoEnd,
    };

    dispatch(setDates(datesState));
    return datesState;
  };
  return fetchDatesThunk;
}

export function fetchELearningPlans(year?: number) {
  const fetchELearningPlansThunk: ThunkAction<Promise<void>, AppState, undefined, SetELearningPlansAction> = async (dispatch) => {
    if (!year) {
      year = getSchoolYearFromDate(new Date());
    }
    const plans = await getELearningPlans(year);
    dispatch(setELearningPlans(plans));
  };
  return fetchELearningPlansThunk;
}
