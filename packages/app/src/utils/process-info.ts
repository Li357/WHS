import fetch from 'react-native-fetch-polyfill';
import { load } from 'react-native-cheerio';
import { DateType, DateSchema } from '@whs/server';

import { processSchedule } from './process-schedule';
import {
  HEADER_SELECTOR, STUDENT_OVERVIEW_SELECTOR, STUDENT_ID_SELECTOR,
  SCHOOL_PICTURE_SELECTOR, SCHOOL_PICTURE_REGEX, SCHOOL_PICTURE_BLANK_FLAG, SCHOOL_PICTURE_BLANK_SYMBOL,
  SCHEDULE_SELECTOR, SCHEDULE_REGEX, LOGIN_URL, FETCH_TIMEOUT, LOGIN_ERROR_SELECTOR, DATES_URL,
} from '../constants/fetch';
import { UserInfo, UserOverviewMap, UserOverviewKeys } from '../types/store';
import { Schedule, TeacherSchedule, RawSchedule } from '../types/schedule';
import { NetworkError } from './error';

/**
 * Parses HTML page of given URL
 * @param url to fetch HTML from
 * @param options to pass to `fetch`
 */
export async function parseHTMLFromURL(url: string, options?: RequestInit) {
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
  const matches = $(SCHOOL_PICTURE_SELECTOR).css('background-image').match(SCHOOL_PICTURE_REGEX);
  if (matches === null || matches[1].includes(SCHOOL_PICTURE_BLANK_FLAG)) {
    return SCHOOL_PICTURE_BLANK_SYMBOL;
  }
  return matches[1];
}

/**
 * Converts name in format "last, first" to "first last"
 * @param rawName raw name from website
 */
export function processName(rawName: string) {
  return rawName.split(', ').reverse().join(' ');
}

/**
 * Gets the user's info from parsed user page HTML
 * @param $ cheerio selector for parsed HTML
 */
export function getUserInfoFromHTML($: CheerioSelector): UserInfo {
  const [rawName, subtitle] = $(HEADER_SELECTOR).children().map((i, el) => $(el).text().trim()).get();
  const isTeacher = subtitle === 'Teacher';
  const name = isTeacher ? rawName : processName(rawName); // Teachers do not their name in "last, first" format
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
      .reduce((infoMap: UserOverviewMap, currentInfo: CheerioElement) => {
        const [staffRole, staffName] = $(currentInfo).text().split(': ').map((str) => str.trim());
        const infoKey = staffRole.toLowerCase() as UserOverviewKeys;
        infoMap[infoKey] = staffName;
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
  // .text returns empty string in script
  const matches = ($(SCHEDULE_SELECTOR).html() || '').trim().match(SCHEDULE_REGEX);
  const rawSchedule: RawSchedule = matches === null ? [] : JSON.parse(matches[1]).schedule;
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
export async function getTeacherSchedules(teacherSchedules: TeacherSchedule[]): Promise<TeacherSchedule[]> {
  const parsedPages = await Promise.all(teacherSchedules.map(({ url }) => parseHTMLFromURL(url)));
  return parsedPages.map(($, index) => ({
    ...teacherSchedules[index],
    schedule: getUserScheduleFromHTML($),
  }));
}

/**
 * Gets dates from server of specified type and year
 * @param type date type to get
 * @param year year of dates to get
 */
export async function getDates(type: DateType, year: number): Promise<DateSchema[]> {
  const response = await fetch(`${DATES_URL}?year=${year}&type=${type}`, {
    timeout: FETCH_TIMEOUT,
  });
  if (!response.ok) {
    throw new NetworkError('Fetch for dates was not successful!');
  }
  return response.json();
}
