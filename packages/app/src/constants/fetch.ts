import { Platform } from 'react-native';
import { DateListType, YearSettingType } from '@whs/server';

export const PACKAGE_NAME = 'com.li357.whs';
export const IOS_MAX_NOTIFICATIONS = 64;
export const MAX_NOTIFICATION_SETUP_TIMEOUT = 25000;

export const SUCCESS = 'Success';
export const CAUTION = 'Caution';
export const ERROR = 'Error';
export const REFRESHED_MSG = 'Your information has been refreshed.';
export const NETWORK_REQUEST_FAILED_MSG = `An error occurred while fetching data. \
Please check your internet connection.`;
export const LOGIN_CREDENTIALS_CHANGED_MSG = 'Your login credentials may have changed. Please try logging in again.';
export const NO_SPACE_MSG = `There is not enough space on your phone to save your login, schedule, and other critical \
information. Please clear up some space and retry logging in.`;
export const UNKNOWN_ERROR_MSG = 'Something went wrong. Please try restarting the app.';

export const SCHOOL_WEBSITE = 'https://westside-web.azurewebsites.net';
export const LOGIN_URL = `${SCHOOL_WEBSITE}/account/login`;
export const SEARCH_URL = '/api/search';
export const TEACHER_URL = '/teachers';
export const TEACHER_FETCH_LIMIT = 10;

const API_VERSION = 'v3';
export const SERVER_URL =
  process.env.NODE_ENV === 'development'
    ? Platform.select({ ios: 'http://localhost:5000', android: 'http://10.0.2.2:5000' })
    : 'https://whs-server.herokuapp.com'; // TODO: More dynamic system for production server
export const DATES_URL = `${SERVER_URL}/api/${API_VERSION}/dates`;
export const CUSTOM_DATES_URL = `${SERVER_URL}/api/${API_VERSION}/customDates`;
export const ELEARNINGPLANS_URL = `${SERVER_URL}/api/${API_VERSION}/elearning-plans`;
export const FETCH_TIMEOUT = 5000;

export const DATE_TYPES: DateListType[] = ['assembly', 'no-school', 'early-dismissal', 'late-start', 'wednesday'];
export const SETTING_TYPES: YearSettingType[] = [
  'semester-one-start',
  'semester-one-end',
  'semester-two-start',
  'semester-two-end',
];

export const HEADER_SELECTOR = '.header-title';
export const STUDENT_OVERVIEW_SELECTOR = '.card:first-child > .card-block > .card-subtitle:not(.text-muted)';
export const STUDENT_ID_SELECTOR = '.card:first-child > .card-block > .card-text:last-child';

export const SCHOOL_PICTURE_SELECTOR = '.profile-picture';
export const SCHOOL_PICTURE_REGEX = /url\((.+)\)/;
export const SCHOOL_PICTURE_BLANK_FLAG = 'blank';
export const SCHOOL_PICTURE_BLANK_SYMBOL = '@@blank-user';

export const SCHEDULE_SELECTOR = 'body > script:not([src])';
export const SCHEDULE_REGEX = /'(.+)';$/;
export const NO_HOMEROOM_TITLE = 'No Homeroom';

export const LOGIN_ERROR_SELECTOR = '.alert.alert-danger';
