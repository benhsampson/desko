import { selectView, setView, View } from '../lib/features/view/viewSlice';
import { useAppDispatch, useAppSelector } from '../lib/hooks';

type Props = {
  children: (props: {
    view: View;
    setView: (newView: View) => void;
  }) => React.ReactNode;
};

const CalendarViewRadioButtons = ({ children }: Props) => {
  const view = useAppSelector(selectView);
  const dispatch = useAppDispatch();
  return (
    <>
      {children({
        view,
        setView: (newView) => {
          dispatch(setView(newView));
        },
      })}
    </>
  );
};

export default CalendarViewRadioButtons;
