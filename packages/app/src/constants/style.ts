/** Contains non-theme layout styles */
import { Platform, Dimensions } from 'react-native';

import { hp2px, wp2px, wp, hp } from '../utils/style';

export const ACCENT_COLOR = '#EF4040';

export const TEXT_FONT = Platform.select({ ios: 'SFProDisplay-Bold', android: 'Roboto-Bold' });
export const TEXT_SIZE = Platform.select({ ios: wp('10%'), android: wp('8%') });
export const SUBTEXT_FONT = Platform.select({ ios: 'SFProDisplay-Medium', android: 'Roboto-Medium' });
export const SUBTEXT_SIZE = wp('5%');
export const SMALLTEXT_FONT = SUBTEXT_FONT;
export const SMALLTEXT_SIZE = wp('4%');
export const LARGE_ICON_SIZE = wp('25%');
export const BORDER_WIDTH = '1px';

export const SCREEN_MARGIN_HORIZONTAL = wp2px('10%');

export const NAVBAR_MARGIN_TOP = hp2px('8%');
export const NAVBAR_MARGIN_BOTTOM = hp2px('4%');
export const NAVBAR_TITLE_MARGIN_LEFT = wp2px('10%');

export const DRAWER_MARGIN_HORIZONTAL = wp2px('7%');
export const DRAWER_INFO_MARGIN_TOP = NAVBAR_MARGIN_TOP;
export const DRAWER_INFO_MARGIN_BOTTOM = hp2px('3%');
export const DRAWER_INFO_IMAGE_SIZE = wp('25%');

export const HAMBURGER_WIDTH = wp2px('10%');
export const HAMBURGER_HEIGHT = hp2px('3.5%');
export const HAMBURGER_LINE_HEIGHT = hp2px('0.5%');
export const HAMBURGER_LINE_BORDER_RADIUS = '2px';

// Controls both input and button form elements
export const FORM_HEIGHT = Math.min(hp('8%'), 50);
export const FORM_BORDER_RADIUS = FORM_HEIGHT / 2;
export const FORM_MARGIN_VERTICAL_NUM = hp('1%');
export const FORM_MARGIN_VERTICAL = `${FORM_MARGIN_VERTICAL_NUM}px`;
export const FORM_PADDING_HORIZONTAL = wp2px('5%');

export const INPUT_BORDER_WIDTH = BORDER_WIDTH;
export const INPUT_ACTIVE_COLOR = '#FFFFFF';

export const BUTTON_MARGIN_VERTICAL = FORM_MARGIN_VERTICAL;

export const LOGIN_HEADER_MARGIN = `${FORM_MARGIN_VERTICAL_NUM * 2}px`;
export const LOGIN_IMAGE_SIZE = hp('23%');

export const PROFILE_INFO_MARGIN_LEFT = '7%';
export const PROFILE_PHOTO_SIZE = wp('30%');
export const PROFILE_MARGIN_BOTTOM = hp2px('4%');
export const PROFILE_HEIGHT = 1.25 * PROFILE_PHOTO_SIZE;

export const BADGE_BUTTON_HEIGHT_NUM = hp('3%');
export const BADGE_BUTTON_HEIGHT = `${BADGE_BUTTON_HEIGHT_NUM}px`;
export const BADGE_BUTTON_RADIUS = BADGE_BUTTON_HEIGHT_NUM / 2;
export const BADGE_BUTTON_MARGIN_VERTICAL = hp2px('0.06%');
export const BADGE_BUTTON_PADDING_HORIZONTAL = wp2px('2.5%');
export const BADGE_BUTTON_TEXT_SIZE = wp2px('2.5%');

export const CARD_MARGIN_BOTTOM = hp2px('2.5%');
export const CARD_PADDING = wp2px('5%');
export const CARD_PADDING_TOP = hp2px('5%');
export const CARD_BORDER_RADIUS = FORM_BORDER_RADIUS;
export const CARD_BORDER_WIDTH = BORDER_WIDTH;

export const SCHEDULE_CARD_BODYTEXT_SIZE = SMALLTEXT_SIZE;
export const SCHEDULE_CARD_ITEM_HEIGHT = hp('15%');

export const ADD_SCHEDULE_TEACHER_PHOTO_SIZE = FORM_HEIGHT * 0.6;
export const ADD_SCHEDULE_TEACHER_PHOTO_MARGIN_LEFT = '5%';
