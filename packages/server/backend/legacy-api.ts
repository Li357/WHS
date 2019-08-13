import { Router } from 'express';
import { format } from 'date-fns';

import { asyncRoute } from './utils';
import { DateSchema } from '../shared/types/api';

// Beware of spaghetti

const legacyRouter = Router();

// < v2.0-b6 SUPPORT
legacyRouter.get('/otherDates', asyncRoute(async ({ db }, res, next) => {
  const yearRange = '18-19';
  const dates = (await db!.collection('otherDates').findOne({}))[yearRange];
  res.status(200).json(dates);
}));

// < v2.0-b6 SUPPORT
legacyRouter.get('/specialDates', asyncRoute(async ({ db }, res, next) => {
  const currentYear = String(new Date().getFullYear());
  const [asm, nos, lts, ead] = (await Promise.all([
    'assembly', 'no-school', 'late-start', 'early-dismissal',
  ].map((type) => (
    db!.collection('dates').find({ year: currentYear, type }).toArray()
  )))).map((arr) => arr.map((dateObj: DateSchema) => (
    format(new Date(dateObj.date), 'MMMM D YYYY')
  )));

  const [sos, soe, sts, ste] = (await Promise.all([
    'semester-one-start', 'semester-one-end', 'semester-two-start', 'semester-two-end',
  ].map((type) => (
    db!.collection('dates').find({ year: currentYear, type }).toArray()
  )))).map((arr) => format(new Date(arr[0].date), 'MMMM D YYYY'));

  res.status(200).json({
    assemblyDates: asm,
    otherNoSchoolDates: [],
    noSchoolDates: nos,
    lateStartDates: lts,
    earlyDismissalDates: ead,
    semesterOneStart: sos,
    semesterOneEnd: soe,
    semesterTwoStart: sts,
    lastDay: ste,
  });
}));

legacyRouter.get('/api/specialDates', asyncRoute(async (
  { db, query: { type: dateType, year, onlyDates } }, res, next,
) => {
  if (!dateType && year) {
    if (onlyDates) {
      const dateArrays = await Promise.all(['assembly', 'no-school', 'late-start', 'early-dismissal'].map((type) => (
        db!.collection('dates').find({ year, type }).toArray()
      )));
      const [
        assemblyDates,
        noSchoolDates,
        lateStartDates,
        earlyDismissalDates,
      ] = dateArrays.map((dateArray) => dateArray.map((dateObj) => new Date(dateObj.date).toISOString()));

      const settings = await Promise.all([
        'semester-one-start', 'semester-one-end', 'semester-two-start', 'semester-two-end',
      ].map((type) => (
        db!.collection('dates').find({ year, type }).toArray()
      )));
      const [
        semesterOneStart,
        semesterOneEnd,
        semesterTwoStart,
        lastDay,
      ] = settings.map((dateArray) => new Date(dateArray[0].date).toISOString());

      return res.status(200).json({
        assemblyDates,
        noSchoolDates,
        lateStartDates,
        earlyDismissalDates,
        semesterOneStart,
        semesterOneEnd,
        semesterTwoStart,
        lastDay,
      });
    }

    const docs = await db!.collection('dates').find({ year }).toArray();
    return res.status(200).json(docs);
  }

  const doc = await db!.collection('specialDates').findOne({ type: dateType, year });
  res.status(200).json(doc);
}));

export default legacyRouter;
