# WHS Server
Administrator backend for the [WHS App](https://github.com/Li357/WHS) built with TypeScript, Vue, Express, and MongoDB.

To develop locally, install dependencies (`yarn`) then build (`yarn build`). Finally, create a `start.sh` script at the root and export the following env vars:
- `MONGO_DB_URL`: url of the MongoDB database
- `MONGO_DB_NAME`: name of the MongoDB database (likely `whs`)
Also execute `yarn start` to start the Express server in the script.
