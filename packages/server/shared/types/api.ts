export interface DatesQuery {
  type?: string;
  year?: string;
}

export interface Schema {
  _id?: string;
}

export type DateListType =
  | 'assembly'
  | 'no-school'
  | 'early-dismissal'
  | 'late-start';
export type YearSettingType =
  | 'semester-one-start'
  | 'semester-one-end'
  | 'semester-two-start'
  | 'semester-two-end';
export type DateType = DateListType | YearSettingType | 'elearning';
export type DateTypeNames = { [K in DateType]: string };
export interface DateSchema<T = DateType> extends Schema {
  type: T;
  year: string;
  date: string;
  comment: string;
}
export type DateSchemaWithoutID<T = DateType> = Omit<DateSchema<T>, '_id'>;

export interface UserSchema extends Schema {
  username: string;
  password: string;
  admin: boolean;
}

export interface LoginBody {
  username?: string;
  password?: string;
}

export type NameGroup = [string, string];
export type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
export interface ELearningPlanSchema extends Schema {
  year: string;
  name: string;
  groups: { [K in Day]: NameGroup[] };
  dates: string[]; // ISO strings
}

export interface ELearningQuery {
  year?: string;
}

export interface CustomDatesQuery {
  year?: string;
}

export interface CustomDateSchema extends Schema {
  year: string;
  date: string;
  scheduleDay: number;
  wednesday: boolean;
}
