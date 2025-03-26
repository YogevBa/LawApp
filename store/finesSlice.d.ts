import { ThunkAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface FineAnalysis {
  summary?: string;
  keyPoints?: string[];
  recommendation?: string;
  result?: 'correct' | 'incorrect' | 'partially';
}

export interface Fine {
  reportNumber: string;
  date: string;
  violation: string;
  amount: string;
  location: string;
  isPaid: boolean;
  analysis?: FineAnalysis;
}

export interface FinesState {
  fines: Record<string, Fine>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  currentFine: Fine | null;
}

// Action types
export const ADD_FINE = 'fines/addFine';
export const REMOVE_FINE = 'fines/removeFine';
export const UPDATE_FINE = 'fines/updateFine';
export const SET_CURRENT_FINE = 'fines/setCurrentFine';
export const ADD_ANALYSIS = 'fines/addAnalysis';
export const CLEAR_ALL_FINES = 'fines/clearAllFines';

// Action creators
export function addFine(fine: Fine): { type: typeof ADD_FINE; payload: Fine };
export function removeFine(fineId: string): { type: typeof REMOVE_FINE; payload: string };
export function updateFine(payload: { fineId: string; updates: Partial<Fine> }): { type: typeof UPDATE_FINE; payload: { fineId: string; updates: Partial<Fine> } };
export function setCurrentFine(fine: Fine | null): { type: typeof SET_CURRENT_FINE; payload: Fine | null };
export function addAnalysis(payload: { fineId: string; analysis: FineAnalysis }): { type: typeof ADD_ANALYSIS; payload: { fineId: string; analysis: FineAnalysis } };
export function clearAllFines(): { type: typeof CLEAR_ALL_FINES };

// Async thunk
export function analyzeFine(fineReport: { reportNumber: string }): ThunkAction<Promise<any>, RootState, undefined, any>;

// Selectors
export function selectAllFines(state: RootState): Record<string, Fine>;
export function selectFineById(state: RootState, fineId: string): Fine | undefined;
export function selectFinesArray(state: RootState): Fine[];
export function selectFinesStatus(state: RootState): string;
export function selectFinesError(state: RootState): string | null;
export function selectCurrentFine(state: RootState): Fine | null;

// Middleware
export const saveFinesMiddleware: any;

// Reducer
export default function reducer(state: FinesState, action: any): FinesState;