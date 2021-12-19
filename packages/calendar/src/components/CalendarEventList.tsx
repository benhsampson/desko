import { List, ListItem, ListItemText } from '@mui/material';

export interface CalendarEvent {
  name: string;
}

type Props = {
  events: CalendarEvent[];
};

export default function CalendarEventList({ events }: Props) {
  return (
    <List dense disablePadding>
      {events.map((event, index) => (
        <ListItem key={`EventListItem${index}`} disableGutters>
          <ListItemText primary={event.name} />
        </ListItem>
      ))}
    </List>
  );
}
