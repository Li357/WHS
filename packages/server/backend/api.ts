import { Router } from 'express';

import {
  DatesQuery,
  DateSchema,
  ELearningPlanSchema,
  ELearningQuery,
  CustomDatesQuery,
  CustomDateSchema,
} from '../shared/types/api';
import { asyncRoute, log, requiresAuth } from './utils';

const api = Router();

api.get(
  '/dates',
  asyncRoute(async ({ query, db }, res) => {
    const { type, year } = query as DatesQuery;
    const dbQuery: DatesQuery = {};
    if (type !== undefined) {
      dbQuery.type = type;
    }
    if (year !== undefined) {
      dbQuery.year = year;
    }

    const collection = db!.collection<DateSchema>('dates');
    const dates = await collection.find(dbQuery).toArray();
    log(`Processed GET /dates successfully with ${dates.length} dates.`);
    res.status(200).json(dates);
  }),
);

api.post(
  '/dates',
  requiresAuth((user) => user.admin),
  asyncRoute(async ({ body, db }, res) => {
    const writeOperations = body as object[];
    const {
      insertedCount = 0,
      matchedCount = 0,
      modifiedCount = 0,
      deletedCount = 0,
      upsertedCount = 0,
    } = await db!.collection<DateSchema>('dates').bulkWrite(writeOperations);

    log(
      `Processed POST /dates successfully with ${insertedCount} inserted, ${matchedCount} matched, ` +
        `${modifiedCount} modified, ${deletedCount} deleted, and ${upsertedCount} upserted.`,
    );
    res.status(200).end();
  }),
);

api.get(
  '/elearning-plans',
  asyncRoute(async ({ query, db }, res) => {
    const { year } = query as ELearningQuery;
    const collection = db!.collection<ELearningPlanSchema>('elearningPlans');
    const plans = await collection
      .find(year !== undefined ? { year } : {})
      .toArray();
    res.status(200).json(plans);
  }),
);

api.post(
  '/elearning-plans',
  requiresAuth((user) => user.admin),
  asyncRoute(async ({ query = {}, body, db }, res) => {
    const { year } = query as ELearningQuery;
    const collection = db!.collection<ELearningPlanSchema>('elearningPlans');
    if (year !== undefined) {
      // nuclear option cuz I'm lazy
      await collection.deleteMany({ year });
    }
    await Promise.all(
      body.map(({ _id, ...plan }: ELearningPlanSchema) =>
        collection.updateOne(
          { name: plan.name, year: plan.year },
          { $set: plan },
          {
            upsert: true,
          },
        ),
      ),
    );
    res.status(200).end();
  }),
);

api.get(
  '/custom-dates',
  asyncRoute(async ({ query, db }, res) => {
    const { year } = query as CustomDatesQuery;
    const collection = db!.collection<CustomDateSchema>('customDates');
    const dates = await collection
      .find(year !== undefined ? { year } : {})
      .toArray();
    res.status(200).json(dates);
  }),
);

export default api;
