import {
  getLoginURL,
  getLoginError,
  getSchoolPictureFromHTML,
  processName,
  getUserScheduleFromHTML,
  getUserInfoFromHTML,
  getTeacherSchedules,
  getTeacherSearchURL,
  getTeacherURL,
  fetchTeachersFromQuery,
} from '../../src/utils/process-info';
import { fetch } from '../../src/utils/utils';
import { LOGIN_URL, SCHOOL_PICTURE_BLANK_SYMBOL, TEACHER_FETCH_LIMIT } from '../../src/constants/fetch';
import { processSchedule } from '../../src/utils/process-schedule';
import {
  getStudent$,
  getError$,
  getNew$,
  getTeacher$,
  fetchMock,
  open,
  TEST_HTML_DIR,
  getEmpty$,
} from '../test-utils/fetch';
import { TeacherSchedule } from '../../src/types/schedule';

fetchMock.config.fetch = fetch;
fetchMock
  .post(getTeacherURL(1, 'John', '12345'), open(`${TEST_HTML_DIR}/teacher.html`))
  .post(getTeacherURL(2, 'John', '12345'), open(`${TEST_HTML_DIR}/teacher.html`))
  .post(getTeacherSearchURL('test', TEACHER_FETCH_LIMIT, 'John', '12345'), []);

describe('processing user info', () => {
  describe('getLoginURL', () => {
    it('should create URL to POST to for login', () => {
      expect(getLoginURL('John', '12345')).toEqual(`${LOGIN_URL}?Username=John&Password=12345`);
    });
  });

  describe('getSchoolPictureFromHTML', () => {
    it('should get school picture if it exists', async () => {
      expect(getSchoolPictureFromHTML(await getStudent$())).toEqual('https://URL_TO_PHOTO');
    });

    it('should get school picture of teacher', async () => {
      expect(getSchoolPictureFromHTML(await getTeacher$())).toEqual('https://URL_TO_PHOTO');
    });

    it('should return path to blank user if it does not', async () => {
      expect(getSchoolPictureFromHTML(await getNew$())).toEqual(SCHOOL_PICTURE_BLANK_SYMBOL);
    });
  });

  describe('processName', () => {
    it('converts name from "last, first" to "first, last"', () => {
      expect(processName('Smith, John')).toEqual('John Smith');
    });

    it('should return an empty string if supplied with one', () => {
      expect(processName('')).toEqual('');
    });
  });

  describe('getUserInfoFromHTML', () => {
    it('should handle student HTML', async () => {
      expect(getUserInfoFromHTML(await getStudent$())).toEqual({
        name: 'Andrew Li',
        schoolPicture: 'https://URL_TO_PHOTO',
        profilePhoto: 'https://URL_TO_PHOTO',
        isTeacher: false,
        classOf: 'Class of 2021',
        homeroom: 'John Smith',
        counselor: 'John Johnson',
        dean: 'Jeff Ronson',
        id: '99999',
      });
    });

    it('should handle teacher HTML', async () => {
      expect(getUserInfoFromHTML(await getTeacher$())).toEqual({
        name: 'John Smith',
        schoolPicture: 'https://URL_TO_PHOTO',
        profilePhoto: 'https://URL_TO_PHOTO',
        isTeacher: true,
        classOf: 'Teacher',
      });
    });

    it('should handle new user (missing staff, picture)', async () => {
      expect(getUserInfoFromHTML(await getNew$())).toEqual({
        name: 'Andrew Li',
        schoolPicture: SCHOOL_PICTURE_BLANK_SYMBOL,
        profilePhoto: SCHOOL_PICTURE_BLANK_SYMBOL,
        isTeacher: false,
        classOf: 'Class of 2021',
        id: '99999',
        counselor: 'John Johnson',
      });
    });
  });

  describe('getUserScheduleFromHTML', () => {
    it('should return schedule if it exists', async () => {
      expect(getUserScheduleFromHTML(await getStudent$())).toEqual(
        processSchedule([
          {
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
          },
        ]),
      );
    });

    it('should return teacher schedule', async () => {
      expect(getUserScheduleFromHTML(await getTeacher$())).toEqual(
        processSchedule([
          {
            sourceId: 26559,
            sourceType: 'course',
            title: 'English 1 S2',
            body: 'Rm. 113 (Grossman)',
            roomNumber: '113',
            sectionNumber: 5,
            phaseNumber: 1,
            day: 2,
            startMod: 14,
            length: 1,
            endMod: 15,
            data: { courseId: '476' },
          },
        ]),
      );
    });

    it('should handle case when there is no schedule', async () => {
      expect(getUserScheduleFromHTML(await getEmpty$())).toEqual(processSchedule([]));
    });
  });

  describe('getLoginError', () => {
    it('should return error when exists', async () => {
      expect(getLoginError(await getError$())).toEqual('The Username or Password was incorrect.');
    });

    it('should return empty string if it does not', async () => {
      expect(getLoginError(await getStudent$())).toEqual('');
    });
  });

  describe('fetchTeachersFromQuery', () => {
    it('should launch request to fetch teachers list', async () => {
      expect(await fetchTeachersFromQuery('test', 'John', '12345')).toEqual([]);
    });
  });

  describe('getTeacherSchedules', () => {
    it('should get specified teacher schedules', async () => {
      const teacherOneURL = getTeacherURL(1, 'John', '12345');
      const teacherTwoURL = getTeacherURL(2, 'John', '12345');
      const mockTeacherSchedules: TeacherSchedule[] = [
        { url: teacherOneURL, name: 'Teacher 1', schedule: [] },
        { url: teacherTwoURL, name: 'Teacher 2', schedule: [] },
      ];
      const expectedTeacherSchedule = getUserScheduleFromHTML(await getTeacher$());
      expect(await getTeacherSchedules(mockTeacherSchedules)).toEqual([
        { url: teacherOneURL, name: 'Teacher 1', schedule: expectedTeacherSchedule },
        { url: teacherTwoURL, name: 'Teacher 2', schedule: expectedTeacherSchedule },
      ]);
    });
  });

  describe('getTeacherSearchURL', () => {
    it('should return login url with return url', () => {
      const url = getTeacherSearchURL('John', 10, 'Jeff', 'Smith');
      expect(url).toEqual(
        `${LOGIN_URL}?Username=Jeff&Password=Smith&ReturnUrl=%2Fapi%2Fsearch%3Fquery%3DJohn%26limit%3D10`,
      );
    });
  });

  describe('getTeacherURL', () => {
    it('should return login url with return url', () => {
      const url = getTeacherURL(320, 'Jeff', 'Smith');
      expect(url).toEqual(`${LOGIN_URL}?Username=Jeff&Password=Smith&ReturnUrl=%2Fteachers%2F320`);
    });
  });
});
