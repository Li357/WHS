import express from 'express';
import path from 'path';
import cors from 'cors';

import { mongodb, log, errorHandler } from './utils';

const { MONGO_DB_NAME, MONGO_DB_URL, NODE_ENV, PORT = 5000 } = process.env;
if (MONGO_DB_URL === undefined || MONGO_DB_NAME === undefined) {
  throw new Error('Please set environment variables. See README.md.');
}

const FRONTEND_PATH = '../frontend'; // relative to ./dist/backend once built
const app = express();

app.use(express.json());
app.use(mongodb(MONGO_DB_URL, MONGO_DB_NAME));

if (NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, FRONTEND_PATH)));
} else {
  app.use(cors());
}

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, FRONTEND_PATH, 'index.html'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  log(`Server running on ${PORT}`);
});
