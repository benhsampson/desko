import { Box } from '@mui/material';
import { CalendarContainer, Calendar } from '@desko/calendar';

export default function NewCal() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CalendarContainer.default>
        <Calendar.default />
      </CalendarContainer.default>
    </Box>
  );
}
