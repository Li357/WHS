import {
  getLoginURL, getLoginError, getSchoolPictureFromHTML, processName, getUserScheduleFromHTML, getUserInfoFromHTML,
} from '../../src/utils/process-info';
import { LOGIN_URL, SCHOOL_PICTURE_BLANK_SYMBOL } from '../../src/constants/fetch';
import { processSchedule } from '../../src/utils/process-schedule';
import { getStudent$, getError$, getNew$, getTeacher$ } from '../utils/fetch';

describe('processing user info', () => {
  describe('parseHTMLFromURL', () => {
    it.todo('should fetch and parse HTML at URL');
  });

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
      expect(getUserScheduleFromHTML(await getStudent$())).toEqual(processSchedule([{
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
      }]));
    });

    it('should return teacher schedule', async () => {
      expect(getUserScheduleFromHTML(await getTeacher$())).toEqual(processSchedule([{
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
      }]));
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

  describe('fetchTeacherSchedules', () => {
    it.todo('should fetch specified teacher schedules');
  });
});
