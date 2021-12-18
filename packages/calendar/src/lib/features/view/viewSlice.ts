import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';

export type View = 'DAY' | 'MONTH';

export interface ViewState {
  view: View;
}

const initialState: ViewState = {
  view: 'MONTH',
};

export const viewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    setView: (state, action: PayloadAction<View>) => {
      state.view = action.payload;
    },
  },
});

export const { setView } = viewSlice.actions;
export const selectView = (state: RootState) => state.view.view;

export default viewSlice.reducer;
