/** Contains non-theme layout styles */
import { Platform } from 'react-native';

import { hp2px, wp2px, wp, hp } from '../utils/style';

export const BORDER_RADIUS = 25;

export const TEXT_FONT = Platform.select({ ios: 'SFProDisplay-Bold', android: 'Roboto-Bold' });
export const TEXT_SIZE = 40;
export const SUBTEXT_FONT = Platform.select({ ios: 'SFProDisplay-Medium', android: 'Roboto-Medium' });
export const SUBTEXT_SIZE = 20;
export const SMALLTEXT_FONT = SUBTEXT_FONT;
export const SMALLTEXT_SIZE = 15;
export const BORDER_WIDTH = '1px';

export const SCREEN_MARGIN_HORIZONTAL = wp2px('10%');

export const NAVBAR_MARGIN_TOP = hp2px('8%');
export const NAVBAR_MARGIN_BOTTOM = hp2px('6%');

export const DRAWER_MARGIN_HORIZONTAL = wp2px('7%');
export const DRAWER_INFO_MARGIN_TOP = NAVBAR_MARGIN_TOP;
export const DRAWER_INFO_MARGIN_BOTTOM = NAVBAR_MARGIN_BOTTOM;

export const HAMBURGER_WIDTH = '40px';
export const HAMBURGER_HEIGHT = '27px';
export const HAMBURGER_LINE_HEIGHT = '4px';
export const HAMBURGER_LINE_BORDER_RADIUS = '2px';

// Controls both input and button form elements
export const FORM_HEIGHT = BORDER_RADIUS * 2;
export const FORM_BORDER_RADIUS = BORDER_RADIUS;
export const FORM_MARGIN_VERTICAL = '7.5px';
export const FORM_PADDING_HORIZONTAL = '20px';

export const INPUT_BORDER_WIDTH = BORDER_WIDTH;
export const INPUT_ACTIVE_COLOR = '#FFFFFF';

export const BUTTON_MARGIN_VERTICAL = FORM_MARGIN_VERTICAL;

export const LOGIN_HEADER_MARGIN = '15px'; // 2x form vertical margin
export const LOGIN_IMAGE_SIZE = hp('23%');

export const PROFILE_INFO_MARGIN_LEFT = '7%';
export const PROFILE_PHOTO_SIZE = wp('35%');
export const PROFILE_PHOTO_BORDER_RADIUS = PROFILE_PHOTO_SIZE / 2;
export const PROFILE_MARGIN_BOTTOM = hp('4%');

export const BADGE_BUTTON_HEIGHT = '20px';
export const BADGE_BUTTON_RADIUS = '10px';
export const BADGE_BUTTON_MARGIN_VERTICAL = '5px';
export const BADGE_BUTTON_PADDING_HORIZONTAL = '10px';
export const BADGE_BUTTON_TEXT_SIZE = 10;

export const CARD_MARGIN_BOTTOM = '20px';
export const CARD_PADDING = '20px';
export const CARD_PADDING_TOP = '40px';
export const CARD_BORDER_RADIUS = BORDER_RADIUS;
export const CARD_BORDER_WIDTH = BORDER_WIDTH;

export const SCHEDULE_CARD_BODYTEXT_SIZE = 15;
export const SCHEDULE_CARD_ITEM_HEIGHT = hp('15%');
export const SCHEDULE_CARD_ITEM_PADDING = '5px';
