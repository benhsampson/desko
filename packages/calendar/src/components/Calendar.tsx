import moment from 'moment';
import { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  ButtonGroup,
  Stack,
  Toolbar,
  Popover,
} from '@mui/material';
import { StaticDatePicker } from '@mui/lab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import {
  setDate,
  decrementMonth,
  incrementMonth,
  selectDate,
} from '../lib/features/calendar/calendarSlice';
import { useAppSelector } from '../lib/hooks';

const formatDateSelector = (date: Date | null) =>
  moment(date).format('MMMM YYYY');

const Calendar: React.FC = ({ children }) => {
  // const [date, setDate] = useState<Date | null>(new Date());
  // const handleChangeDate = (newDate: Date | null) => {
  //   setDate(newDate);
  // };

  // const incrementDate = () => setDate(moment(date).add(1, 'M').toDate());
  // const decrementDate = () => setDate(moment(date).subtract(1, 'M').toDate());
  const date = useAppSelector(selectDate);

  const [dateSelectorAnchorEl, setDateSelectorAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const isDateSelectorOpen = !!dateSelectorAnchorEl;
  const handleOpenDateSelector = (event: React.MouseEvent<HTMLButtonElement>) =>
    setDateSelectorAnchorEl(event.currentTarget);
  const handleCloseDateSelector = () => setDateSelectorAnchorEl(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="relative"
        variant="outlined"
        color="default"
        elevation={0}
      >
        <Toolbar>
          <Stack direction="row" spacing={2}>
            <ButtonGroup variant="outlined">
              <Button>Day</Button>
              <Button>Month</Button>
            </ButtonGroup>
            <ButtonGroup aria-label="prev next button group">
              <Button onClick={decrementMonth} startIcon={<ArrowBackIcon />}>
                Previous
              </Button>
              <Button
                onClick={handleOpenDateSelector}
                variant="outlined"
                endIcon={
                  isDateSelectorOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />
                }
              >
                {formatDateSelector(date)}
              </Button>
              <Button onClick={incrementMonth} endIcon={<ArrowForwardIcon />}>
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
              value={date}
              onChange={setDate}
              renderInput={() => <></>}
            />
          </Popover>
        </Toolbar>
      </AppBar>
      {children}
    </Box>
  );
};

export default Calendar;
