import { DateSchemaWithoutID } from '../../shared/types/api';

export type ClientDate = DateSchemaWithoutID & {
  _id?: string;
  saved: boolean;
};
