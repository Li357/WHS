import { Router, CookieOptions } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { asyncRoute, requiresAuth, log } from './utils';
import { LoginBody, UserSchema } from '../shared/types/api';

const authRouter = Router();

const oneDay = 1000 * 60 * 60 * 24;
const payloadCookieOptions: CookieOptions = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: true,
  maxAge: oneDay,
};
const signatureCookieOptions: CookieOptions = {
  ...payloadCookieOptions,
  httpOnly: true,
};

authRouter.post('/login', asyncRoute(async ({ body, db }, res, next) => {
  const { username, password } = body as LoginBody;
  if (username === undefined || password === undefined) {
    return res.status(400).end();
  }

  const user = await db!.collection<UserSchema>('users').findOne({ username });
  if (user === null) {
    log(`Failed login attempt with ${username}!`);
    return res.status(401).end();
  }

  const auth = await bcrypt.compare(password, user.password);
  if (!auth) {
    log(`Failed login attempt with ${username}!`);
    return res.status(401).end();
  }

  const { _id: id, admin } = user;
  jwt.sign({ id, admin }, process.env.SECRET!, { expiresIn: '1d' }, (error, token) => {
    if (error) {
      return next(error);
    }

    const [header, payload, signature] = token.split('.');
    res.cookie('payload', `${header}.${payload}`, payloadCookieOptions);
    res.cookie('signature', signature, signatureCookieOptions);
    log(`Successful login attempt with ${username}!`);
    res.status(200).end();
  });
}));

authRouter.post('/logout', requiresAuth((user) => user !== undefined), (req, res) => {
  res.clearCookie('payload', payloadCookieOptions);
  res.clearCookie('signature', signatureCookieOptions);
  log('Successful logout!');
  res.status(200).end();
});

export default authRouter;
