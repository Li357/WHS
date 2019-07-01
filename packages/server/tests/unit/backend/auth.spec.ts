import { MongoClient, Db, ObjectId } from 'mongodb';
import request, { SuperTest, Test } from 'supertest';
import bcrypt from 'bcrypt';

import initializeApp from '../../../backend/app';
import { UserSchema } from '../../../shared/types/api';

describe('auth API', () => {
  let connection: MongoClient;
  let db: Db;
  let api: SuperTest<Test>;

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

    const usersCollection = db.collection<UserSchema>('users');
    await usersCollection.insertMany(mockUsers);
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if either credential is undefined', async () => {
      const res = await api.post('/api/auth/login');
      expect(res.status).toBe(400);
      expect(res.text).toBe('');
    });

    it('should return 401 if the username does not exist', async () => {
      const res = await api.post('/api/auth/login').send({ username: 'Jeff', password: '' });
      expect(res.status).toBe(401);
      expect(res.text).toBe('');
    });

    it('should return 401 if the password is incorrect', async () => {
      const bob = await api.post('/api/auth/login').send({ username: 'Bob', password: '' });
      expect(bob.status).toBe(401);
      expect(bob.text).toBe('');

      const john = await api.post('/api/auth/login').send({ username: 'John', password: '' });
      expect(john.status).toBe(401);
      expect(john.text).toBe('');
    });

    it('should return cookies and 200 if credentials correct', async () => {
      const bob = await api.post('/api/auth/login').send({ username: 'Bob', password: passwords[0] });
      const [payload, signature] = bob.get('Set-Cookie');
      expect(bob.status).toBe(200);
      expect(payload.includes('Max-Age=86400')).toBe(true);
      expect(payload.includes('Path=/')).toBe(true);
      expect(payload.includes('SameSite=Strict')).toBe(true);
      expect(signature.includes('Max-Age=86400')).toBe(true);
      expect(signature.includes('Path=/')).toBe(true);
      expect(signature.includes('SameSite=Strict')).toBe(true);
      expect(signature.includes('HttpOnly')).toBe(true);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 401 if no user logged in', async () => {
      const res = await api.post('/api/auth/logout');
      expect(res.status).toBe(401);
      expect(res.text).toBe('');
    });

    it('should clear cookies and return 200 if user is logged in', async () => {
      const john = await api.post('/api/auth/login').send({ username: 'John', password: passwords[1] });
      const cookies = john.get('Set-Cookie'); // https://github.com/visionmedia/supertest/issues/336
      const res = await api.post('/api/auth/logout').set('Cookie', cookies);
      expect(res.status).toBe(200);
      const [payload, signature] = res.get('Set-Cookie');
      expect(payload.includes('payload=;')).toBe(true);
      expect(signature.includes('signature=;')).toBe(true);
    });
  });

  afterAll(async () => {
    await connection.close();
  });
});
