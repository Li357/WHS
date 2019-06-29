import { ObjectId } from 'mongodb';

export interface DatesQuery {
  type?: string;
  year?: string;
}

export interface DatesDbQuery {
  type?: string;
  year?: number;
}

export interface Schema {
  _id: string;
}

export interface DateSchema extends Schema {
  type: string;
  year: number;
  date: string;
}

export interface UserSchema extends Schema {
  username: string;
  password: string;
  admin: boolean;
}

export interface LoginBody {
  username?: string;
  password?: string;
}
