import { AppBar, Box, Toolbar, Stack } from '@mui/material';
import {
  CalendarContainer,
  CalendarViewRadioButtons,
  CalendarDateActions,
  CalendarView,
} from '@desko/calendar';

import { useDummyEvents } from '../lib/dummy';

function NewCal() {
  const { loading, data, refetch } = useDummyEvents();
  return (
    <CalendarContainer
      onDateChange={(start, end) => {
        console.log(start, end);
        void refetch();
      }}
    >
      <Box
        sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <AppBar
          position="relative"
          variant="outlined"
          color="default"
          elevation={0}
        >
          <Toolbar>
            <Stack direction="row" spacing={2}>
              <CalendarViewRadioButtons isDisabled={loading} />
              <CalendarDateActions isDisabled={loading} />
            </Stack>
          </Toolbar>
        </AppBar>
        <CalendarView eventSlots={data} />
      </Box>
    </CalendarContainer>
  );
}

export default NewCal;
