import React from 'react';
import styled from 'styled-components/native';

import { SCHOOL_PICTURE_BLANK_SYMBOL } from '../../constants/fetch';
import BlankUser from '../../../assets/images/blank-user.png';

const ProfileImage = styled.Image<{ size: number }>`
  width: 100%;
  height: 100%;
  border-radius: ${({ size }) => size / 2};
`;

interface AvatarProps {
  source: string;
  size: number;
}

export default function Avatar({ source, size }: AvatarProps) {
  const photoSource = source === SCHOOL_PICTURE_BLANK_SYMBOL ? BlankUser : { uri: source };
  return (<ProfileImage source={photoSource} size={size} />);
}
