import { Store } from '@reduxjs/toolkit';
import { FinesState } from './finesSlice';

export interface RootState {
  fines: FinesState;
}

declare const store: Store<RootState>;

export default store;