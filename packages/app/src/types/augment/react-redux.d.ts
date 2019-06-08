import 'react-redux';
import { Dispatch, Action } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

declare module 'react-redux' {
  // TODO: Remove once @types/react-redux adds hooks
  export function useSelector<S, T>(selector: (state: S) => T, equalityFn?: (a: S, b: S) => boolean): T;
  export function useDispatch<S, A extends Action<any>>(): ThunkDispatch<S, undefined, A>;
}
