import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import finesReducer, { addFine, saveFinesMiddleware } from './finesSlice';

// Create the store with middleware
const store = configureStore({
  reducer: {
    fines: finesReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(saveFinesMiddleware),
});

// Load saved fines from AsyncStorage
const loadSavedFines = async () => {
  try {
    const savedFines = await AsyncStorage.getItem('fines');
    
    if (savedFines) {
      const fines = JSON.parse(savedFines);
      
      // Dispatch actions to add each fine to the store
      Object.values(fines).forEach(fine => {
        store.dispatch(addFine(fine));
      });
      
      console.log('Loaded saved fines from AsyncStorage:', Object.keys(fines).length);
    }
  } catch (error) {
    console.error('Error loading fines from AsyncStorage:', error);
  }
};

// Load saved fines when the store is created
loadSavedFines();

export default store;