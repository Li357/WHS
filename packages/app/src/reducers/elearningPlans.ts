import { ELearningPlansState, ELearningPlansAction, ELearningPlansActions } from '../types/store';
import { initialELearningPlansState } from '../constants/store';

export default function elearningPlansReducer(state: ELearningPlansState = initialELearningPlansState, action: ELearningPlansAction) {
  switch (action.type) {
    case ELearningPlansActions.SET_PLANS:
      return action.payload;
    default:
      return state;
  }
}
