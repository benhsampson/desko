import { AppBar, Box, Toolbar, Stack } from '@mui/material';
import {
  CalendarContainer,
  CalendarViewRadioButtons,
  CalendarDateActions,
  CalendarView,
} from '@desko/calendar';

export default function NewCal() {
  return (
    <CalendarContainer>
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
              <CalendarViewRadioButtons />
              <CalendarDateActions />
            </Stack>
          </Toolbar>
        </AppBar>
        <CalendarView
          events={[
            {
              timestamp: '2021-12-20',
              events: [
                {
                  name: 'something',
                },
              ],
            },
          ]}
        />
      </Box>
    </CalendarContainer>
  );
}
