import { combineReducers, configureStore } from '@reduxjs/toolkit';
import themeConfigSlice from './themeConfigSlice';
import authReducer from './authSlice';
import storage from 'redux-persist/lib/storage'; // Default is localStorage
import { persistReducer, persistStore } from 'redux-persist';

// Combine reducers
const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    auth: authReducer,
});

// Persist configuration
const persistConfig = {
    key: 'root',
    storage, // use localStorage or sessionStorage
    whitelist: ['auth', 'themeConfig'], // Add the reducers you want to persist
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store
const store = configureStore({
    reducer: persistedReducer,
});

// Create the persistor
export const persistor = persistStore(store);

export default store;

export type IRootState = ReturnType<typeof rootReducer>;
