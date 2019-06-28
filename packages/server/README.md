# WHS Server
Administrator backend for the [WHS App](https://github.com/Li357/WHS) built with TypeScript, Vue, Express, and MongoDB.

To develop locally, install dependencies (`yarn`) then build (`yarn build`). Finally, create a `start.sh` script at the root and export the following env vars:

- `MONGO_DB_URL`: url of the MongoDB database
- `MONGO_DB_NAME`: name of the MongoDB database (likely `whs`)
- `SECRET`: secret used to sign login JWTs

Also execute `yarn start` to start the Express server in the script.

### Endpoints
For v3:
- `GET /v3/dates` with query params:
  - `year`: school year, e.g. 2019 for the 2019-2020 school year
  - `type`: one of `no-school`, `assembly`, `late-start`, `early-dismissal`, `semester-one-start`, `semester-one-end`, `semester-two-start`, `semester-two-end`
- `POST /v3/dates`
- `POST /auth/login`
- `POST /auth/logout`

Legacy:
- < v2.0-b6: `GET /specialDates`
- \> v2.0-b6: `GET /api/specialDates`
