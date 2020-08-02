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
export interface DateSchema extends Schema {
  type: DateType;
  year: string;
  date: string;
  comment: string;
}
export type DateSchemaWithoutID = Omit<DateSchema, '_id'>;

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
export interface ELearningSettingsSchema extends Schema {
  type: 'yellow' | 'red';
  groups: { [K in Day]: NameGroup[] };
  dates: Date[];
}
