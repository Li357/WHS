import { RawClassItemKeys } from '../types/schedule';

export const SCHOOL_WEBSITE = 'https://westside-web.azurewebsites.net';
export const LOGIN_URL = `${SCHOOL_WEBSITE}/account/login`;
export const FETCH_TIMEOUT = 5000;

export const HEADER_SELECTOR = '.header-title';
export const STUDENT_OVERVIEW_SELECTOR = '.card:first-child > .card-block > .card-subtitle:not(.text-muted)';
export const STUDENT_ID_SELECTOR = '.card:first-child > .card-block > .card-text:last-child';

export const SCHOOL_PICTURE_SELECTOR = '.profile-picture';
export const SCHOOL_PICTURE_REGEX = /url\((.+)\)/;
export const SCHOOL_PICTURE_BLANK = 'blank';
export const SCHOOL_PICTURE_BLANK_SYMBOL = '@@blank-user';

export const SCHEDULE_SELECTOR = 'body > script:not([src])';
export const SCHEDULE_REGEX = /'(.+)';$/;
export const SCHEDULE_RESTRICTED_KEYS: RawClassItemKeys[] = ['sectionNumber', 'phaseNumber', 'data'];

export const LOGIN_ERROR_SELECTOR = '.alert.alert-danger';
