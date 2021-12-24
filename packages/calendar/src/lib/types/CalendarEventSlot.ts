import { CalendarEvent } from './CalendarEvent';

export type CalendarEventSlot = {
  date: string;
  events: CalendarEvent[];
  canCreate?: boolean;
};
