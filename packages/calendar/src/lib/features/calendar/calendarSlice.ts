import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import moment from 'moment';
import { RootState } from '../../store';

export interface CalendarState {
  date: Date | null;
}

const initialState: CalendarState = {
  date: null,
};

export const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setDate: (state, action: PayloadAction<Date | null>) => {
      state.date = action.payload;
    },
    incrementMonth: (state) => {
      state.date = moment(state.date).add(1, 'M').toDate();
    },
    decrementMonth: (state) => {
      state.date = moment(state.date).subtract(1, 'M').toDate();
    },
  },
});

export const { setDate, incrementMonth, decrementMonth } =
  calendarSlice.actions;
export const selectDate = (state: RootState) => state.calendar.date;

export default calendarSlice.reducer;
