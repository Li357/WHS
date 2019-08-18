import configureMockStore from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';
import fetch from 'react-native-fetch-polyfill';
import { URL } from 'url';
import { DateSchema } from '@whs/server';

import { AppState, UserActions, UserAction, AppAction, DatesActions, SetDatesAction } from '../../src/types/store';
import { LOGIN_URL, DATES_URL } from '../../src/constants/fetch';
import { fetchMock, open, TEST_HTML_DIR } from '../test-utils/fetch';
import { fetchUserInfo, fetchSchoolPicture, fetchDates } from '../../src/actions/async';
import { processSchedule } from '../../src/utils/process-schedule';
import { initialUserState, initialDayState, initialDatesState } from '../../src/constants/store';
import { lightTheme } from '../../src/constants/theme';
import { LoginError, NetworkError } from '../../src/utils/error';
import dates from './test-dates/dates.json';

const initialAppState: AppState = {
  user: initialUserState,
  day: initialDayState,
  theme: lightTheme,
  dates: initialDatesState,
};
const datesArray = dates as unknown as DateSchema[];
const mockStore = configureMockStore<AppState, ThunkDispatch<AppState, undefined, AppAction>>([thunk]);
fetchMock.config.fetch = fetch;
fetchMock
  .post(`${LOGIN_URL}?Username=Li357&Password=12345`, open(`${TEST_HTML_DIR}/student.html`))
  .post(`${LOGIN_URL}?Username=Li357&Password=02345`, open(`${TEST_HTML_DIR}/error.html`))
  .post(`${LOGIN_URL}?Username=Test&Password=12345`, 400)
  .get(`begin:${DATES_URL}?year=2019`, (url) => {
    const urlObj = new URL(url);
    const type = urlObj.searchParams.get('type');
    return datesArray.filter((dateObj) => type === dateObj.type && dateObj.year === '2019');
  });

describe('async actions', () => {
  describe('fetchUserInfo', () => {
    it('fetches user shedule and sets store', async () => {
      const username = 'Li357';
      const password = '12345';
      const expectedActions: UserAction[] = [
        {
          type: UserActions.SET_USER_INFO,
          payload: {
            name: 'Andrew Li',
            schoolPicture: 'https://URL_TO_PHOTO',
            profilePhoto: 'https://URL_TO_PHOTO',
            isTeacher: false,
            classOf: 'Class of 2021',
            homeroom: 'John Smith',
            counselor: 'John Johnson',
            dean: 'Jeff Ronson',
            id: '99999',
          },
        },
        {
          type: UserActions.SET_USER_SCHEDULE,
          payload: processSchedule([{
            sourceId: 26271,
            sourceType: 'course',
            title: 'Band',
            body: 'Rm. 181 (Krueger)',
            roomNumber: '181',
            sectionNumber: 3,
            phaseNumber: 1,
            day: 5,
            startMod: 1,
            length: 1,
            endMod: 2,
            data: null,
          }]),
        },
        {
          type: UserActions.SET_TEACHER_SCHEDULES,
          payload: [],
        },
        {
          type: UserActions.SET_USER_CREDENTIALS,
          payload: { username, password },
        },
      ];
      const store = mockStore(initialAppState);
      await store.dispatch(fetchUserInfo(username, password));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('throws a LoginError if credentials are wrong', async () => {
      const store = mockStore(initialAppState);
      await expect(store.dispatch(fetchUserInfo('Li357', '02345'))).rejects.toThrowError(LoginError);
    });

    it('throws a NetworkError if request was not okay', async () => {
      const store = mockStore(initialAppState);
      await expect(store.dispatch(fetchUserInfo('Test', '12345'))).rejects.toThrowError(NetworkError);
    });
  });

  describe('fetchSchoolPicture', () => {
    it('fetches school picture separately and sets store', async () => {
      const expectedActions: UserAction[] = [
        {
          type: UserActions.SET_USER_INFO,
          payload: {
            schoolPicture: 'https://URL_TO_PHOTO',
          },
        },
      ];
      const store = mockStore(initialAppState);
      await store.dispatch(fetchSchoolPicture('Li357', '12345'));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('fetchDates', () => {
    it('fetches dates and sets store', async () => {
      const expectedActions: SetDatesAction[] = [
        {
          type: DatesActions.SET_DATES,
          payload: {
            assembly: [new Date(datesArray[0].date)],
            noSchool: [],
            earlyDismissal: [],
            lateStart: [],
            semesterOneStart: null,
            semesterOneEnd: new Date(datesArray[1].date),
            semesterTwoStart: null,
            semesterTwoEnd: null,
          },
        },
      ];

      const store = mockStore(initialAppState);
      await store.dispatch(fetchDates(2019));
      expect(JSON.stringify(store.getActions())).toEqual(JSON.stringify(expectedActions));
    });
  });
});
