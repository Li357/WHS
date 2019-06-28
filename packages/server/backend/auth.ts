import { Router, CookieOptions } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { asyncRoute } from './utils';
import { LoginBody, UserSchema } from './types/api';

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
  const user = await db!.collection<UserSchema>('users').findOne({ username });
  if (user === null) {
    return res.status(401).end();
  }

  const auth = await bcrypt.compare(password, user.password);
  if (!auth) {
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
    res.status(200).end();
  });
}));

authRouter.post('/logout', (req, res) => {
  res.clearCookie('payload', payloadCookieOptions);
  res.clearCookie('signature', signatureCookieOptions);
  res.status(200).end();
});

export default authRouter;
