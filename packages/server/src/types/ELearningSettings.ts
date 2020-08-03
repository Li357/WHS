import { ELearningType } from '../../shared/types/api';

export interface ELearningDate {
  type: ELearningType;
  date: string;
  saved: boolean;
}
