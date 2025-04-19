import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Uses localStorage
import { combineReducers } from 'redux';
import userReducer, {UserState} from './slices/userSlice';
import { PersistPartial } from 'redux-persist/es/persistReducer'; // Import PersistPartial for redux-persist

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // only persist `user` slice
};

const rootReducer = combineReducers({
  user: userReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist to work
    }),
});

// Ensure to type the store properly for PersistPartial
export const persistor = persistStore(store);
export default store;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState> & { user: PersistPartial & UserState }; // Merging PersistPartial
