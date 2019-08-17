import AsyncStorage from '@react-native-community/async-storage';

import { reportNotEnoughSpace } from './utils';

export function getProfilePhoto(username: string) {
  return AsyncStorage.getItem(`${username}:profile-photo`);
}

export async function setProfilePhoto(username: string, newPhoto: string) {
  try {
    await AsyncStorage.setItem(`${username}:profile-photo`, newPhoto);
  } catch (error) {
    reportNotEnoughSpace();
  }
}

export function removeProfilePhoto(username: string) {
  return AsyncStorage.removeItem(`${username}:profile-photo`);
}
