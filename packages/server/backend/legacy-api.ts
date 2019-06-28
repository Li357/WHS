import { Router } from 'express';
import { format } from 'date-fns';

import { asyncRoute } from './utils';
import { DateTypeKey, Date, DateSchema, SettingsSchema, Settings } from './types/legacy-api';

const legacyRouter = Router();

const dateTypeKeys = {
  1: 'assemblyDates',
  2: 'noSchoolDates',
  3: 'lateStartDates',
  4: 'earlyDismissalDates',
};

// < v2.0-b6 SUPPORT
legacyRouter.get('/otherDates', asyncRoute(async ({ db }, res, next) => {
  const yearRange = '18-19';
  const dates = (await db!.collection('otherDates').findOne({}))[yearRange];
  res.status(200).json(dates);
}));

// < v2.0-b6 SUPPORT
legacyRouter.get('/specialDates', asyncRoute(async ({ db }, res, next) => {
  const currentYear = new Date().getFullYear();
  const [asm, nos, lts, ead] = (await Promise.all(Array(4).fill(undefined).map((item, i) => (
    db!.collection('specialDates').findOne({
      type: String(i + 1),
      year: String(currentYear),
    })
  )))).map((doc) => (doc ? doc.dates : []).map((dateObj: Date) => (
    format(new Date(dateObj.date), 'MMMM D YYYY')
  )));

  const { settings } = await db!.collection<DateSchema | SettingsSchema>('specialDates').findOne({
    type: '5',
    year: String(currentYear),
  }) as SettingsSchema;
  (Object.keys(settings) as Array<keyof Settings>).forEach((key) => {
    settings[key] = format(new Date(settings[key]), 'MMMM D YYYY');
  });

  res.status(200).json({
    assemblyDates: asm,
    otherNoSchoolDates: [],
    noSchoolDates: nos,
    lateStartDates: lts,
    earlyDismissalDates: ead,
    ...settings,
  });
}));

// 2.x SUPPORT
legacyRouter.get('/api/specialDates', asyncRoute(async (
  { db, query: { type: dateType, year, onlyDates } }, res, next,
) => {
  if (!dateType && year) {
    const docs = await db!.collection('specialDates').find({ year }).toArray();

    // Request for only dates by app
    if (onlyDates) {
      const specialDates = docs.reduce((datesDict, { type, dates, settings }) => {
        if (type === '5') {
          return {
            ...datesDict,
            ...settings,
          };
        }

        // eslint-disable-next-line no-param-reassign
        datesDict[dateTypeKeys[type as DateTypeKey]] = [
          ...datesDict[dateTypeKeys[type as DateTypeKey]] || [],
          ...dates.map((obj: Date) => obj.date),
        ];
        return datesDict;
      }, {});
      res.status(200).json(specialDates);
      return;
    }

    res.status(200).json(docs);
    return;
  }

  const doc = await db!.collection('specialDates').findOne({ type: dateType, year });
  res.status(200).json(doc);
}));

export default legacyRouter;
