import React, { memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components/native';

import Input from '../components/Input';
import Button from '../components/Button';
import Text from '../components/Text';
import { fetchUserInfo } from '../actions/async';
import { AppState, AppAction } from '../types/store';
import { LOGIN_HEADER_MARGIN, LOGIN_IMAGE_SIZE } from '../constants/style';
import WHS from '../../assets/images/WHS.png';

const Header = styled(Text)`
  margin: ${LOGIN_HEADER_MARGIN} 0;
`;

const Image = styled.Image`
  height: ${LOGIN_IMAGE_SIZE};
`;

export default memo(function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppState, AppAction>();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await dispatch(fetchUserInfo(username, password));
    } catch (error) {
      setError(true);
      // TODO: Handle specific errors
    }
    setLoading(false);
  };

  const canLogin = username.length > 0 && password.length > 0 && !loading;

  return (
    <>
      <Image source={WHS} resizeMode="contain" />
      <Header>Login to WHS</Header>
      <Input placeholder="Username" value={username} onChangeText={setUsername} error={error} />
      <Input placeholder="Password" value={password} onChangeText={setPassword} error={error} secureTextEntry={true} />
      <Button onPress={handleLogin} disabled={!canLogin}>Login</Button>
    </>
  );
});
