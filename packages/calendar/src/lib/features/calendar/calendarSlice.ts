import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import moment from 'moment';
import { RootState } from '../../store';

export interface CalendarState {
  date: string | null;
}

const initialState: CalendarState = {
  date: new Date().toISOString(),
};

export const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setDate: (state, action: PayloadAction<string | null>) => {
      state.date = action.payload;
    },
    incrementMonth: (state) => {
      state.date = moment(state.date).add(1, 'M').toISOString();
    },
    decrementMonth: (state) => {
      state.date = moment(state.date).subtract(1, 'M').toISOString();
    },
    incrementDay: (state) => {
      state.date = moment(state.date).add(1, 'd').toISOString();
    },
    decrementDay: (state) => {
      state.date = moment(state.date).subtract(1, 'd').toISOString();
    },
  },
});

export const {
  setDate,
  incrementMonth,
  decrementMonth,
  incrementDay,
  decrementDay,
} = calendarSlice.actions;
export const selectDate = (state: RootState) => state.calendar.date;

export default calendarSlice.reducer;
