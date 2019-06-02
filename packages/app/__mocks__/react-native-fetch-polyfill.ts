import { fetchMock } from '../__tests__/utils/fetch';

const polyfill = jest.requireActual('react-native-fetch-polyfill');
fetchMock.config = {
  ...fetchMock.config,
  fetch: polyfill,
};
export default fetchMock;
