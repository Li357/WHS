/** Contains non-theme layout styles */
import { Platform } from 'react-native';

import { hp2px, wp2px, wp } from '../utils/style';

export const TEXT_FONT = Platform.select({ ios: 'SFProDisplay-Bold', android: 'Roboto-Bold' });
export const TEXT_SIZE = 40;
export const SUBTEXT_FONT = Platform.select({ ios: 'SFProDisplay-Light', android: 'Roboto-Light' });
export const SUBTEXT_SIZE = 20;

export const SCREEN_MARGIN_HORIZONTAL = wp2px('10%');

export const NAVBAR_MARGIN_TOP = hp2px('8%');
export const NAVBAR_MARGIN_BOTTOM = hp2px('5%');

export const HAMBURGER_WIDTH = '40px';
export const HAMBURGER_HEIGHT = '30px';
export const HAMBURGER_LINE_HEIGHT = '5px';
export const HAMBURGER_LINE_BORDER_RADIUS = '2.5px';

// Controls both input and button form elements
export const FORM_HEIGHT = '50px';
export const FORM_BORDER_RADIUS = '25px'; // 1/2 of height
export const FORM_MARGIN_VERTICAL = '7.5px';

export const INPUT_PADDING_HORIZONTAL = '20px';
export const INPUT_BORDER_WIDTH = '1px';

export const LOGIN_HEADER_MARGIN = '15px'; // 2x form vertical margin
export const LOGIN_IMAGE_SIZE = '25%'; // of window height

export const PROFILE_INFO_MARGIN_LEFT = '7%';
export const PROFILE_PHOTO_SIZE = wp('35%');
export const PROFILE_PHOTO_BORDER_RADIUS = PROFILE_PHOTO_SIZE / 2;
