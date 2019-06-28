import { log, connectToMongoDB, cleanUp } from './utils';
import initializeApp from './app';

const { MONGO_DB_NAME, MONGO_DB_URL, SECRET, PORT = 5000 } = process.env;
if (MONGO_DB_URL === undefined || MONGO_DB_NAME === undefined || SECRET === undefined) {
  log('ERROR! Please set environment variables. See README.md.');
  process.exit(-1);
}

(async () => {
  try {
    const { client, db } = await connectToMongoDB(MONGO_DB_URL!, MONGO_DB_NAME!);
    const app = initializeApp(db);

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
