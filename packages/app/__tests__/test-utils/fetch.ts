import fs from 'fs';
import { load } from 'react-native-cheerio';
import { resolve } from 'path';
import { FetchMockSandbox } from 'fetch-mock';

export function open(path: string) {
  return fs.promises.readFile(path, { encoding: 'utf8' });
}

export const TEST_HTML_DIR = resolve(__dirname, '../info/test-html');
export const getStudent$ = async () => load(await open(`${TEST_HTML_DIR}/student.html`));
export const getError$ = async () => load(await open(`${TEST_HTML_DIR}/error.html`));
export const getNew$ = async () => load(await open(`${TEST_HTML_DIR}/new.html`));
export const getTeacher$ = async () => load(await open(`${TEST_HTML_DIR}/teacher.html`));

// tslint:disable-next-line: no-var-requires
export const fetchMock: FetchMockSandbox = require('fetch-mock').sandbox();
