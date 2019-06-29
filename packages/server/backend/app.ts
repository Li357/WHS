import express from 'express';
import { Db } from 'mongodb';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';

import { attachDB, errorHandler } from './utils';
import api from './api';
import auth from './auth';
import legacy from './legacy-api';

export default function initializeApp(db: Db) {
  const FRONTEND_PATH = '../frontend'; // relative to ./dist/backend once built
  const app = express();

  app.use(cookieParser());
  app.use(attachDB(db));
  app.use(express.json());

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, FRONTEND_PATH)));
  } else {
    app.use(cors());
  }

  app.use('/v3', api);
  app.use('/auth', auth);
  app.use(legacy);

  app.get('*', (req, res) => {
    res.status(200).sendFile(path.resolve(__dirname, FRONTEND_PATH, 'index.html'));
  });
  app.use(errorHandler);
  return app;
}
