import { MongoClient } from 'mongodb';
import { ErrorRequestHandler, Handler } from 'express';

export function asyncMiddleware(fn: Handler) {
  const middleware: Handler = async (req, res, next) => {
    try {
      await fn(req, res, next);
      next();
    } catch (error) {
      next(error);
    }
  };
  return middleware;
}

export function mongodb(url: string, name: string) {
  const middleware: Handler = async (req, res, next) => {
    const database = await MongoClient.connect(url, { useNewUrlParser: true });
    req.db = database.db(name);
  };
  return asyncMiddleware(middleware);
}

export function log(message: string) {
  // tslint:disable-next-line: no-console
  console.log(`[${new Date()}]: ${message}`);
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  log(`ERROR ${err}`);
  res.status(500);
};
