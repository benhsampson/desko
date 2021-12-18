import { Provider as ReduxProvider } from 'react-redux';
import { LocalizationProvider } from '@mui/lab';
import DateAdapter from '@mui/lab/AdapterMoment';

import store from '../lib/store';

const CalendarContainer: React.FC = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <LocalizationProvider dateAdapter={DateAdapter}>
        {children}
      </LocalizationProvider>
    </ReduxProvider>
  );
};

export default CalendarContainer;
