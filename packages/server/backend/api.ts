import { Router } from 'express';

import { DatesQuery, DateSchema } from './types/api';
import { asyncRoute, log } from './utils';

const api = Router();

api.get('/dates', asyncRoute(async ({ query, db }, res) => {
  const { type, year } = query as DatesQuery;

  const collection = db!.collection<DateSchema>('dates');
  const dates = await collection.find({ type, year }).toArray();
  log(`Processed GET /dates successfully with ${dates.length} dates.`);
  res.status(200).json(dates);
}));

api.post('/dates', asyncRoute(async ({ body, db }, res) => {
  const writeOperations = body as object[];
  const {
    insertedCount = 0,
    matchedCount = 0,
    modifiedCount = 0,
    deletedCount = 0,
    upsertedCount = 0,
    result = {},
  } = await db!.collection<DateSchema>('dates').bulkWrite(writeOperations, { ordered: false });

  log(
    `Processed POST /dates successfully with ${insertedCount} inserted, ${matchedCount} matched, ` +
    `${modifiedCount} modified, ${deletedCount} deleted, and ${upsertedCount} upserted.`,
  );
  res.status(200).json(result);
}));

export default api;
