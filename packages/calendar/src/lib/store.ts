import { configureStore } from '@reduxjs/toolkit';

import calendarReducer from './features/calendar/calendarSlice';
import viewReducer from './features/view/viewSlice';

const store = configureStore({
  reducer: {
    calendar: calendarReducer,
    view: viewReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
