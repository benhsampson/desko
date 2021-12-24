import {
  IconButton,
  List,
  ListItem as MuiListItem,
  ListItemButton as MuiListItemButton,
  ListItemText,
  Popover as MuiPopover,
  styled,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { ListItemIcon } from '@mui/material';
import { CalendarEvent } from '../lib/types/CalendarEvent';

type Props = {
  events: CalendarEvent[];
  handleDeleteEvent?: (id: string) => void;
  maxRows?: number;
};

const ListItem = styled(MuiListItem)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0, 1),

  '&:not(:last-child)': {
    marginBottom: theme.spacing(0.125),
  },
}));

const ListItemButton = styled(MuiListItemButton)(({ theme }) => ({
  padding: theme.spacing(0.125, 1),
}));

const POPOVER_WIDTH = 240;

const Popover = styled(MuiPopover)(({ theme }) => ({
  '& .MuiPopover-paper': {
    width: POPOVER_WIDTH,
    padding: theme.spacing(0.5),
  },
}));

export default function CalendarEventList({ maxRows = 5, ...props }: Props) {
  const overflow = props.events.length > maxRows;

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const isOpen = !!anchorEl;
  const handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const renderEventItems = (events: CalendarEvent[]) => (
    <>
      {events.map((event, index) => (
        <ListItem key={`EventListItem${index}`}>
          <ListItemText primary={event.name} />
          {event.canDelete ? (
            <IconButton
              onClick={() => {
                void (
                  props.handleDeleteEvent && props.handleDeleteEvent(event.id)
                );
              }}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
        </ListItem>
      ))}
    </>
  );

  return (
    <>
      <List
        dense
        disablePadding
        sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}
      >
        {renderEventItems(
          props.events.slice(0, overflow ? maxRows - 1 : maxRows)
        )}
        {overflow && (
          <ListItemButton onClick={handleOpen}>
            <ListItemIcon>
              <ExpandMoreIcon />
            </ListItemIcon>
            <ListItemText primary="See All" />
          </ListItemButton>
        )}
      </List>
      <Popover open={isOpen} anchorEl={anchorEl} onClose={handleClose}>
        <List dense disablePadding>
          {renderEventItems(props.events)}
        </List>
      </Popover>
    </>
  );
}
