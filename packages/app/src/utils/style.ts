import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

/**
 * Converts height percentage to pixel value accounting for pixel ratios
 * @param percentage to convert
 */
export function hp2px(percentage: string) {
  return `${hp(percentage)}px`;
}

/**
 * Converts width percentage to pixel value accounting for pixel ratios
 * @param percentage to convert
 */
export function wp2px(percentage: string) {
  return `${wp(percentage)}px`;
}

export { wp, hp };
