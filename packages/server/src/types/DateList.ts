import { DateSchemaWithoutID } from '../../shared/types/api';

export interface ClientDate extends DateSchemaWithoutID {
  _id?: string;
  saved: boolean;
}
