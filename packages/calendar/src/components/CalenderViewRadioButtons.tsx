import { Button, ButtonGroup, styled } from '@mui/material';
import { selectView, setView } from '../lib/features/view/viewSlice';
import { useAppDispatch, useAppSelector } from '../lib/hooks';

const RadioButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ selected }) => ({
  ...(selected && {
    background: 'rgba(0,0,0,0.05)',
  }),
}));

type Props = {
  isDisabled?: boolean;
};

const CalendarViewRadioButtons = ({ isDisabled }: Props) => {
  const view = useAppSelector(selectView);
  const dispatch = useAppDispatch();
  return (
    <>
      <ButtonGroup variant="outlined" disabled={isDisabled}>
        <RadioButton
          selected={view === 'DAY'}
          onClick={() => dispatch(setView('DAY'))}
        >
          Day
        </RadioButton>
        <RadioButton
          selected={view === 'MONTH'}
          onClick={() => dispatch(setView('MONTH'))}
        >
          Month
        </RadioButton>
      </ButtonGroup>
    </>
  );
};

export default CalendarViewRadioButtons;
