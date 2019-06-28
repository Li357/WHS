import express from 'express';
import path from 'path';
import cors from 'cors';

import { log, errorHandler, connectToMongoDB, attachDB, cleanUp } from './utils';
import api from './api';

const { MONGO_DB_NAME, MONGO_DB_URL, NODE_ENV, PORT = 5000 } = process.env;
if (MONGO_DB_URL === undefined || MONGO_DB_NAME === undefined) {
  log('ERROR! Please set environment variables. See README.md.');
  process.exit(-1);
}

(async () => {
  try {
    const { client, db } = await connectToMongoDB(MONGO_DB_URL!, MONGO_DB_NAME!);

    const FRONTEND_PATH = '../frontend'; // relative to ./dist/backend once built
    const app = express();

    app.use(attachDB(db));
    app.use(express.json());
    app.use('/v3', api);

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

    process.on('SIGINT', cleanUp(client));
    process.on('SIGTERM', cleanUp(client));
  } catch (error) {
    log(`ERROR while connecting to database! Stacktrace:\n${error}`);
    process.exit(1);
  }
})();
