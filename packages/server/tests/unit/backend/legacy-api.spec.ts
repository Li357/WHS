import { MongoClient, Db, ObjectId } from 'mongodb';
import request, { SuperTest, Test } from 'supertest';

import initializeApp from '../../../backend/app';
import { LegacyDateSchema, LegacySettingsSchema, LegacyOtherDateSchema } from '../../../backend/types/legacy-api';

describe('legacy dates API', () => {
  let connection: MongoClient;
  let db: Db;
  let api: SuperTest<Test>;
  const str = JSON.stringify;

  const currYear = String(new Date().getFullYear());
  const mockSpecialDates: Array<LegacyDateSchema | LegacySettingsSchema> = [
    {
      _id: new ObjectId().toHexString(),
      type: '3',
      year: currYear,
      dates: [
        {
          date: '2018-08-28T05:00:00.000Z',
          comment: 'MAPS Testing',
        },
      ],
    },
    {
      _id: new ObjectId().toHexString(),
      type: '4',
      year: currYear,
      dates: [
        {
          date: '2019-01-29T06:00:00.000Z',
          comment: '',
        },
      ],
    },
    {
      _id: new ObjectId().toHexString(),
      type: '5',
      year: currYear,
      settings: {
        semesterOneStart: '2018-08-14T05:00:00.000Z',
        semesterOneEnd: '2018-12-21T06:00:00.000Z',
        semesterTwoStart: '2019-01-07T06:00:00.000Z',
        lastDay: '2019-05-24T05:00:00.000Z',
      },
    },
  ];

  const mockOtherDate = {
    '_id': new ObjectId().toHexString(),
    '18-19': {
      assemblyDates: [
        'November 2 2018',
        'February 1 2019',
        'April 18 2019',
      ],
      otherNoSchoolDates: [
        'April 10 2019',
      ],
      lateStartDates: [
        'August 28 2018',
      ],
      earlyDismissalDates: [
        'January 29 2019',
      ],
    },
  };

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__, { useNewUrlParser: true });
    db = await connection.db(global.__MONGO_DB_NAME__);
    api = request(initializeApp(db));

    const specialDates = db.collection<LegacyDateSchema | LegacySettingsSchema>('specialDates');
    await specialDates.insertMany(mockSpecialDates);

    const otherDates = db.collection<LegacyOtherDateSchema>('otherDates');
    await otherDates.insertOne(mockOtherDate);
  });

  describe('GET /otherDates', () => {
    it('should respond with 200 an other date from 2018-2019', async () => {
      const res = await api.get('/otherDates');
      expect(res.status).toBe(200);
      expect(str(res.body)).toEqual(str(mockOtherDate['18-19']));
    });
  });

  describe('GET /specialDates', () => {
    it('should respond with 200 and dates without otherNoSchoolDates', async () => {
      const res = await api.get('/specialDates');
      expect(res.status).toBe(200);
      expect(str(res.body)).toEqual(str({
        assemblyDates: [],
        otherNoSchoolDates: [],
        noSchoolDates: [],
        lateStartDates: ['August 28 2018'],
        earlyDismissalDates: ['January 29 2019'],
        semesterOneStart: 'August 14 2018',
        semesterOneEnd: 'December 21 2018',
        semesterTwoStart: 'January 7 2019',
        lastDay: 'May 24 2019',
      }));
    });
  });

  describe('GET /api/specialDates', () => {
    // Only endpoint used by app
    it('should respond with 200 with onlyDates and year query', async () => {
      const res = await api.get(`/api/specialDates?year=${currYear}&onlyDates=true`);
      expect(res.status).toBe(200);
      expect(str(res.body)).toEqual(str({
        lateStartDates: ['2018-08-28T05:00:00.000Z'],
        earlyDismissalDates: ['2019-01-29T06:00:00.000Z'],
        semesterOneStart: '2018-08-14T05:00:00.000Z',
        semesterOneEnd: '2018-12-21T06:00:00.000Z',
        semesterTwoStart: '2019-01-07T06:00:00.000Z',
        lastDay: '2019-05-24T05:00:00.000Z',
      }));
    });
  });
});
