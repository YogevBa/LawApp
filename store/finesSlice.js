import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyzeFineReport } from '../services/openaiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Start with an empty fines object
const initialFines = {};

// Async thunk for analyzing a fine report
export const analyzeFine = createAsyncThunk(
  'fines/analyzeFine',
  async (fineReport, { rejectWithValue }) => {
    try {
      console.log("analyzeFine thunk called with:", fineReport);
      console.log("Calling analyzeFineReport from openaiService...");
      const analysis = await analyzeFineReport(fineReport);
      console.log("Analysis result received:", analysis);
      return { fineId: fineReport.reportNumber, analysis };
    } catch (error) {
      console.error("Error in analyzeFine thunk:", error);
      return rejectWithValue(error.message);
    }
  }
);

const finesSlice = createSlice({
  name: 'fines',
  initialState: {
    fines: initialFines,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    currentFine: null
  },
  reducers: {
    // Add a new fine
    addFine: (state, action) => {
      const newFine = action.payload;
      state.fines[newFine.reportNumber] = newFine;
    },
    // Remove a fine by ID
    removeFine: (state, action) => {
      const fineId = action.payload;
      delete state.fines[fineId];
    },
    // Update a fine
    updateFine: (state, action) => {
      const { fineId, updates } = action.payload;
      state.fines[fineId] = { ...state.fines[fineId], ...updates };
    },
    // Set current fine for detailed view
    setCurrentFine: (state, action) => {
      state.currentFine = action.payload;
    },
    // Add analysis to a fine
    addAnalysis: (state, action) => {
      const { fineId, analysis } = action.payload;
      if (state.fines[fineId]) {
        state.fines[fineId].analysis = analysis;
      }
    },

  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeFine.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(analyzeFine.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { fineId, analysis } = action.payload;
        if (state.fines[fineId]) {
          state.fines[fineId].analysis = analysis;
        }
      })
      .addCase(analyzeFine.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to analyze fine';
      });
  }
});

// Export actions
export const { addFine, removeFine, updateFine, setCurrentFine, addAnalysis } = finesSlice.actions;

// Export selectors
export const selectAllFines = (state) => state.fines.fines;
export const selectFineById = (state, fineId) => state.fines.fines[fineId];
export const selectFinesArray = (state) => Object.values(state.fines.fines);
export const selectFinesStatus = (state) => state.fines.status;
export const selectFinesError = (state) => state.fines.error;
export const selectCurrentFine = (state) => state.fines.currentFine;

// Middleware to save fines to AsyncStorage
export const saveFinesMiddleware = store => next => action => {
  const result = next(action);
  
  // These are the actions that modify the fines state
  if (
    action.type === 'fines/addFine' || 
    action.type === 'fines/removeFine' || 
    action.type === 'fines/updateFine' ||
    action.type === 'fines/analyzeFine/fulfilled'
  ) {
    const state = store.getState();
    const fines = state.fines.fines;
    
    // Save to AsyncStorage
    AsyncStorage.setItem('fines', JSON.stringify(fines))
      .catch(error => console.error('Error saving fines to AsyncStorage:', error));
  }
  
  return result;
};

export default finesSlice.reducer;