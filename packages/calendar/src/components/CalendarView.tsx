import { useSelector } from 'react-redux';

import { selectView } from '../lib/features/view/viewSlice';
import CalendarMonthView from './CalendarMonthView';
import CalendarDayView from './CalendarDayView';
import { CalendarEventSlot } from '../lib/types/CalendarEventSlot';

export type CalendarViewProps = {
  eventSlots?: CalendarEventSlot[];
  createEvent?: (date: string) => void | Promise<void>;
  deleteEvent?: (id: string) => void | Promise<void>;
  canCreate?: boolean;
};

export default function CalendarView(props: CalendarViewProps) {
  const view = useSelector(selectView);
  switch (view) {
    case 'MONTH':
      return <CalendarMonthView {...props} />;
    case 'DAY':
      return <CalendarDayView {...props} />;
    default:
      return null;
  }
}
