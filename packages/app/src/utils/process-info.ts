import fetch from 'react-native-fetch-polyfill';
import { load } from 'react-native-cheerio';

import { processSchedule } from './process-schedule';
import {
  HEADER_SELECTOR, STUDENT_OVERVIEW_SELECTOR, STUDENT_ID_SELECTOR,
  SCHOOL_PICTURE_SELECTOR, SCHOOL_PICTURE_REGEX, SCHOOL_PICTURE_BLANK,
  SCHEDULE_SELECTOR, SCHEDULE_REGEX, LOGIN_URL, FETCH_TIMEOUT, LOGIN_ERROR_SELECTOR,
} from '../constants/fetch';
import { UserInfo, UserInfoKeys } from '../types/store';
import { Schedule, ClassItem, TeacherSchedule } from '../types/schedule';
import { NetworkError } from './error';

/**
 * Parses HTML page of given URL
 * @param url to fetch HTML from
 * @param options to pass to `fetch`
 */
export async function parseHTMLFromURL(url: BodyInit_, options?: RequestInit) {
  const response = await fetch(url, {
    timeout: FETCH_TIMEOUT,
    ...options,
  });
  if (!response.ok) {
    throw new NetworkError('Fetch from URL was not successful!');
  }
  const html = await response.text();
  return load(html);
}

/**
 * Returns the login URL to POST to to login as user
 * @param username of the user
 * @param password of the user
 */
export function getLoginURL(username: string, password: string) {
  return `${LOGIN_URL}?Username=${username}&Password=${password}`;
}

/**
 * Gets the user's school picture from parsed user page HTML
 * @param $ cheerio selector for parsed HTML
 */
export function getSchoolPictureFromHTML($: CheerioSelector) {
  const matches = $(SCHOOL_PICTURE_SELECTOR).text().match(SCHOOL_PICTURE_REGEX);
  if (matches === null || matches[0].includes(SCHOOL_PICTURE_BLANK)) {
    return ''; // TODO: Supply blank user url
  }
  return matches[0];
}

/**
 * Converts name in format "last, first" to "first last"
 * @param rawName raw name from website
 */
function processName(rawName: string) {
  const [last, first] = rawName.split(', ');
  return `${first} ${last}`;
}

/**
 * Gets the user's info from parsed user page HTML
 * @param $ cheerio selector for parsed HTML
 */
export function getUserInfoFromHTML($: CheerioSelector): UserInfo {
  const [rawName, subtitle] = $(HEADER_SELECTOR).map((i, el) => $(el).text()).get();
  const name = processName(rawName);
  const isTeacher = subtitle === 'Teacher';
  const schoolPicture = getSchoolPictureFromHTML($);
  const info: UserInfo = {
    name,
    schoolPicture,
    profilePhoto: schoolPicture,
    isTeacher,
    classOf: subtitle,
  };

  if (!isTeacher) {
    const studentOverviewInfo = $(STUDENT_OVERVIEW_SELECTOR).get()
      .reduce((infoMap: Partial<UserInfo>, currentInfo: CheerioElement) => {
        const [staffRole, staffName] = $(currentInfo).text().trim().split(': ');
        infoMap[staffRole.toLowerCase() as UserInfoKeys] = staffName;
        return infoMap;
      }, {});
    const [, id] = $(STUDENT_ID_SELECTOR).text().split(': ');
    return {
      ...info,
      ...studentOverviewInfo,
      id,
    };
  }
  return info;
}

/**
 * Gets the user's schedule from parsed user page HTML
 * @param $ cheerio selector for parsed HTML
 */
export function getUserScheduleFromHTML($: CheerioSelector): Schedule {
  const matches = $(SCHEDULE_SELECTOR).text().match(SCHEDULE_REGEX);
  const rawSchedule: ClassItem[] = matches === null ? [] : JSON.parse(matches[0]).schedule;
  return processSchedule(rawSchedule);
}

/**
 * Gets the login error, if any from the given page
 * @param $ cheerio selector for parsed HTML
 */
export function getLoginError($: CheerioSelector) {
  return $(LOGIN_ERROR_SELECTOR).text().trim();
}

/**
 * Refreshes a given collection of teacher schedules
 * @param teacherSchedules old teacher schedules to refresh
 */
export async function fetchTeacherSchedules(teacherSchedules: TeacherSchedule[]): Promise<TeacherSchedule[]> {
  const parsedPages = await Promise.all(teacherSchedules.map(({ url }) => parseHTMLFromURL(url)));
  return parsedPages.map(($, index) => ({
    ...teacherSchedules[index],
    schedule: getUserScheduleFromHTML($),
  }));
}
