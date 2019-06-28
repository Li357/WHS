import { MongoClient, Db } from 'mongodb';
import { ErrorRequestHandler, Handler } from 'express';
import jwt from 'jsonwebtoken';

import { UserSchema } from './types/api';

export function asyncRoute(fn: Handler) {
  const middleware: Handler = async (req, res, next) => {
    try {
      await fn(req, res, next); // assuming no errors occurred, the response is sent
    } catch (error) {
      next(error);
    }
  };
  return middleware;
}

export function requiresAuth(authFn: (user: UserSchema) => boolean) {
  const middleware: Handler = ({ cookies }, res, next) => {
    const { signature, payload } = cookies;
    const token = `${payload}.${signature}`;
    jwt.verify(token, process.env.SECRET!, (error, decoded) => {
      if (error) {
        return next(error);
      } else if (decoded && authFn(decoded as UserSchema)) {
        return next();
      }
      res.status(401).end();
    });
  };
  return middleware;
}

export async function connectToMongoDB(url: string, name: string) {
  log(`Connecting to database ${name}...`);
  const client = await MongoClient.connect(url, { useNewUrlParser: true });
  log(`Connected to database ${name}.`);
  return {
    client,
    db: client.db(name),
  };
}

export function attachDB(db: Db) {
  const middleware: Handler = (req, res, next) => {
    req.db = db;
    next();
  };
  return middleware;
}

export function log(message: string) {
  // tslint:disable-next-line: no-console
  console.log(`[${new Date()}]: ${message}`);
}

export const errorHandler: ErrorRequestHandler = (error, { method, originalUrl }, res, next) => {
  log(`ERROR during request, ${method} ${originalUrl}! Stacktrace:\n${error}`);
  res.status(500).end();
};

export function cleanUp(client: MongoClient) {
  return async function listener() {
    log('Closing database connection...');
    await client.close();
    log('Closed database connection.');
    process.exit(1);
  };
}
