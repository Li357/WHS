import request, { Test, SuperTest } from 'supertest';
import { MongoClient, Db, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

import initializeApp from '../../../backend/app';
import { DateSchema, UserSchema } from '../../../backend/types/api';

describe('dates API', () => {
  let connection: MongoClient;
  let db: Db;
  let api: SuperTest<Test>;
  const str = JSON.stringify;

  const mockDates = [
    { _id: new ObjectId().toHexString(), type: 'assembly', year: '2018', date: '2018-02-01T22:19:03.002Z' },
    { _id: new ObjectId().toHexString(), type: 'no-school', year: '2019', date: '2019-11-04T13:22:43.005Z' },
  ];

  const passwords = ['12345', '67890'];
  const [bobs, johns] = passwords.map((password) => bcrypt.hashSync(password, 12));
  const mockUsers = [
    { _id: new ObjectId().toHexString(), username: 'Bob', password: bobs, admin: true },
    { _id: new ObjectId().toHexString(), username: 'John', password: johns, admin: false },
  ];

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__, { useNewUrlParser: true });
    db = await connection.db(global.__MONGO_DB_NAME__);
    api = request(initializeApp(db));

    const datesCollection = db.collection<DateSchema>('dates');
    await datesCollection.insertMany(mockDates);

    const usersCollection = db.collection<UserSchema>('users');
    await usersCollection.insertMany(mockUsers);
  });

  describe('GET /api/v3/dates', () => {
    it('should respond with 200 without any query params', async () => {
      const res = await api.get('/api/v3/dates');
      expect(res.status).toBe(200);
      expect(str(res.body)).toEqual(str(mockDates)); // https://github.com/jasmine/jasmine/issues/786
    });

    it('should respect `type` query param', async () => {
      const validType = await api.get('/api/v3/dates?type=assembly');
      expect(validType.status).toBe(200);
      expect(str(validType.body)).toEqual(str([mockDates[0]]));

      const invalidType = await api.get('/api/v3/dates?type=early-dismissal');
      expect(invalidType.status).toBe(200);
      expect(str(invalidType.body)).toEqual(str([]));
    });

    it('should respect `year` query param', async () => {
      const validYear = await api.get('/api/v3/dates?year=2019');
      expect(validYear.status).toBe(200);
      expect(str(validYear.body)).toEqual(str([mockDates[1]]));

      const invalidYear = await api.get('/api/v3/dates?year=2017');
      expect(invalidYear.status).toBe(200);
      expect(str(invalidYear.body)).toEqual(str([]));
    });

    it('should respect `type` and `year` in conjunction', async () => {
      const valid = await api.get('/api/v3/dates?year=2019&type=no-school');
      expect(valid.status).toBe(200);
      expect(str(valid.body)).toEqual(str([mockDates[1]]));

      const invalidType = await api.get('/api/v3/dates?year=2019&type=early-dismissal');
      expect(invalidType.status).toBe(200);
      expect(str(invalidType.body)).toEqual(str([]));

      const invalidYear = await api.get('/api/v3/dates?year=2017&type=assembly');
      expect(invalidYear.status).toBe(200);
      expect(str(invalidYear.body)).toEqual(str([]));
    });
  });

  describe('POST /api/v3/dates', () => {
    it('should respond with 401 without authentication', async () => {
      const res = await api.post('/api/v3/dates');
      expect(res.status).toBe(401);
      expect(res.text).toBe('');

      const john = await api.post('/api/auth/login').send({ username: 'John', password: passwords[1] });
      const cookies = john.get('Set-Cookie');
      const johnPost = await api.post('/api/v3/dates').set('Cookie', cookies);
      expect(johnPost.status).toBe(401);
      expect(res.text).toBe('');
    });

    it('should apply write operations and return 200 when authenticated', async () => {
      const mockDateToInsert = {
        _id: new ObjectId().toHexString(),
        type: 'assembly',
        year: '2018',
        date: '2018-12-05T22:19:03.002Z',
      };

      const bob = await api.post('/api/auth/login').send({ username: 'Bob', password: passwords[0] });
      const cookies = bob.get('Set-Cookie');
      const bobPost = await api.post('/api/v3/dates')
        .set('Cookie', cookies)
        .send([
          {
            updateOne: {
              filter: { _id: mockDates[0]._id },
              update: { $set: { year: '2019' } },
            },
          },
          { deleteOne: { filter: { _id: mockDates[1]._id } } },
          { insertOne: { document: mockDateToInsert } },
        ]);
      expect(bobPost.status).toBe(200);

      const datesCollection = db.collection<DateSchema>('dates');
      const dates = await datesCollection.find().toArray();
      expect(dates).toEqual([
        { ...mockDates[0], year: '2019' },
        mockDateToInsert,
      ]);
    });
  });

  afterAll(async () => {
    await connection.close();
  });
});
