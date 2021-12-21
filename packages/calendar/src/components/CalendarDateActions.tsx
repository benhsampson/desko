import { useState } from 'react';
import { Button, ButtonGroup, Popover } from '@mui/material';
import moment from 'moment';
import { StaticDatePicker } from '@mui/lab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { selectView } from '../lib/features/view/viewSlice';
import {
  decrementDay,
  decrementMonth,
  incrementDay,
  incrementMonth,
  selectDate,
  setDate,
} from '../lib/features/calendar/calendarSlice';
import { useAppDispatch, useAppSelector } from '../lib/hooks';

type Props = {
  isDisabled?: boolean;
};

const CalendarDateActions = ({ isDisabled }: Props) => {
  const view = useAppSelector(selectView);
  const date = useAppSelector(selectDate);
  const dispatch = useAppDispatch();

  const [dateSelectorAnchorEl, setDateSelectorAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const isDateSelectorOpen = !!dateSelectorAnchorEl;
  const handleOpenDateSelector = (event: React.MouseEvent<HTMLButtonElement>) =>
    setDateSelectorAnchorEl(event.currentTarget);
  const handleCloseDateSelector = () => setDateSelectorAnchorEl(null);

  const handlePreviousClick = () => {
    switch (view) {
      case 'DAY':
        return dispatch(decrementDay());
      case 'MONTH':
        return dispatch(decrementMonth());
      default:
        return;
    }
  };

  const handleNextClick = () => {
    switch (view) {
      case 'DAY':
        return dispatch(incrementDay());
      case 'MONTH':
        return dispatch(incrementMonth());
      default:
        return;
    }
  };

  const renderDate = () => {
    let formatString = '';
    switch (view) {
      case 'DAY':
        formatString = 'dddd, MMMM Do YYYY';
        break;
      case 'MONTH':
        formatString = 'MMMM YYYY';
        break;
      default:
        break;
    }
    return moment(date).format(formatString);
  };

  const renderDatePicker = () => {
    switch (view) {
      case 'DAY':
        return (
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            openTo="day"
            value={date ? new Date(date) : null}
            onChange={(newDate) => {
              dispatch(setDate(newDate?.toISOString() || null));
            }}
            renderInput={() => <></>}
          />
        );
      case 'MONTH':
        return (
          <StaticDatePicker
            views={['month', 'year']}
            displayStaticWrapperAs="desktop"
            openTo="month"
            value={date ? new Date(date) : null}
            onChange={(newDate) => {
              dispatch(setDate(newDate?.toISOString() || null));
            }}
            renderInput={() => <></>}
          />
        );
      default:
        return;
    }
  };

  return (
    <>
      <ButtonGroup aria-label="prev next button group" disabled={isDisabled}>
        <Button onClick={handlePreviousClick} startIcon={<ArrowBackIcon />}>
          Back
        </Button>
        <Button
          onClick={handleOpenDateSelector}
          variant="outlined"
          endIcon={isDateSelectorOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {renderDate()}
        </Button>
        <Button onClick={handleNextClick} endIcon={<ArrowForwardIcon />}>
          Next
        </Button>
      </ButtonGroup>
      <Popover
        open={isDateSelectorOpen}
        anchorEl={dateSelectorAnchorEl}
        onClose={handleCloseDateSelector}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {renderDatePicker()}
      </Popover>
    </>
  );
};

export default CalendarDateActions;
