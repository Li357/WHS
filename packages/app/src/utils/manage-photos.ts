import { AsyncStorage } from 'react-native';

export function getProfilePhoto(username: string) {
  return AsyncStorage.getItem(`${username}:profile-photo`);
}

export function setProfilePhoto(username: string, newPhoto: string) {
  return AsyncStorage.setItem(`${username}:profile-photo`, newPhoto);
}

export function removeProfilePhoto(username: string) {
  return AsyncStorage.removeItem(`${username}:profile-photo`);
}
