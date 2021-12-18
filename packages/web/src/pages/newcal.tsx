import {
  AppBar,
  Button,
  Box,
  ButtonGroup,
  Stack,
  Toolbar,
  Popover,
  styled,
} from '@mui/material';
import { StaticDatePicker } from '@mui/lab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  CalendarContainer,
  CalendarViewRadioButtons,
  CalendarDateActions,
  CalendarMonthView,
} from '@desko/calendar';
import { useState } from 'react';

const RadioButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ selected }) => ({
  ...(selected && {
    background: 'rgba(0,0,0,0.05)',
  }),
}));

export default function NewCal() {
  const [dateSelectorAnchorEl, setDateSelectorAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const isDateSelectorOpen = !!dateSelectorAnchorEl;
  const handleOpenDateSelector = (event: React.MouseEvent<HTMLButtonElement>) =>
    setDateSelectorAnchorEl(event.currentTarget);
  const handleCloseDateSelector = () => setDateSelectorAnchorEl(null);

  return (
    <CalendarContainer.default>
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
            <CalendarDateActions.default>
              {({
                date,
                formattedDate,
                setDate,
                incrementMonth,
                decrementMonth,
              }) => (
                <>
                  <Stack direction="row" spacing={2}>
                    <CalendarViewRadioButtons.default>
                      {({ view, setView }) => (
                        <ButtonGroup variant="outlined">
                          <RadioButton
                            selected={view === 'DAY'}
                            onClick={() => setView('DAY')}
                          >
                            Day
                          </RadioButton>
                          <RadioButton
                            selected={view === 'MONTH'}
                            onClick={() => setView('MONTH')}
                          >
                            Month
                          </RadioButton>
                        </ButtonGroup>
                      )}
                    </CalendarViewRadioButtons.default>
                    <ButtonGroup aria-label="prev next button group">
                      <Button
                        onClick={decrementMonth}
                        startIcon={<ArrowBackIcon />}
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={handleOpenDateSelector}
                        variant="outlined"
                        endIcon={
                          isDateSelectorOpen ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )
                        }
                      >
                        {formattedDate}
                      </Button>
                      <Button
                        onClick={incrementMonth}
                        endIcon={<ArrowForwardIcon />}
                      >
                        Next
                      </Button>
                    </ButtonGroup>
                  </Stack>
                  <Popover
                    open={isDateSelectorOpen}
                    anchorEl={dateSelectorAnchorEl}
                    onClose={handleCloseDateSelector}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  >
                    <StaticDatePicker
                      views={['year', 'month']}
                      displayStaticWrapperAs="desktop"
                      openTo="month"
                      value={date ? new Date(date) : null}
                      onChange={(newDate) =>
                        setDate(newDate?.toISOString() || null)
                      }
                      renderInput={() => <></>}
                    />
                  </Popover>
                </>
              )}
            </CalendarDateActions.default>
          </Toolbar>
        </AppBar>
        <CalendarMonthView.default />
      </Box>
    </CalendarContainer.default>
  );
}
