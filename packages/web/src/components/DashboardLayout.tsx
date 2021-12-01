import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton as MuiListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  styled,
} from '@mui/material';
import NextLink from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';

import Logo from './Logo';
import {
  Space,
  useJoinedSpacesQuery,
  useManagerSpacesQuery,
  useUserInfoQuery,
} from '../__generated__/graphql';
import stringToColor from '../lib/utils/stringToColor';
import ErrorDisplay from './ErrorDisplay';
import { getAcronym } from '../lib/utils/getAcronym';
import Loader from './Loader';
import { NextLinkComposed } from './Link';
import { useLogout } from '../lib/utils/useLogout';
import { useQueryVar } from '../lib/utils/useQueryVar';

type ListItemButtonProps = {
  type?: 'heading' | 'category' | 'item';
};

const ListItemButton = styled(MuiListItemButton, {
  shouldForwardProp: (prop) => prop !== 'type',
})<ListItemButtonProps>(({ theme, type }) => ({
  ...(type === 'heading'
    ? {
        boxShadow: `0 -1px 0 ${theme.palette.divider} inset`,
        fontSize: '22px',
        padding: theme.spacing(1.5, 3),
      }
    : type === 'category'
    ? {
        boxShadow: `0 -1px 0 ${theme.palette.divider} inset`,
        color: theme.palette.text.secondary,
      }
    : type === 'item'
    ? {
        padding: theme.spacing(0.25, 2),
        color: theme.palette.text.secondary,
      }
    : {
        color: theme.palette.text.secondary,
      }),
}));

interface SharedSpace extends Partial<Space> {
  id: string;
  name: string;
  maxBookingsPerDay: number;
  code?: string;
}

const DashboardLayout: React.FC = ({ children }) => {
  const logout = useLogout();
  const spaceId = useQueryVar('id');

  const [spaces, setSpaces] = useState<SharedSpace[]>([]);
  const [isManager, setIsManager] = useState(false);

  const _userInfo = useUserInfoQuery();
  const _managerSpaces = useManagerSpacesQuery({
    skip: true,
  });
  const _joinedSpaces = useJoinedSpacesQuery({ skip: true });

  useEffect(() => {
    const handler = async () => {
      const userInfo = await _userInfo.refetch();

      if (!userInfo.error && userInfo.data) {
        switch (userInfo.data.userInfo.roles[0].value) {
          case 'MANAGER':
            setIsManager(true);

            const managerSpaces = await _managerSpaces.refetch();

            if (!managerSpaces.error && managerSpaces.data) {
              setSpaces(managerSpaces.data.managerSpaces);
            }

            break;
          case 'USER':
            const joinedSpaces = await _joinedSpaces.refetch();

            if (!joinedSpaces.error && joinedSpaces.data) {
              setSpaces(joinedSpaces.data.joinedSpaces);
            }

            break;
          default:
            break;
        }
      }
    };

    handler().catch((err) => {
      console.error(err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [accountMenuAnchorEl, setAccountMenuAnchorEl] =
    useState<HTMLElement | null>(null);

  const handleAccountMenuClick = (event: React.MouseEvent<HTMLElement>) =>
    setAccountMenuAnchorEl(event.currentTarget);
  const handleAccountMenuClose = () => setAccountMenuAnchorEl(null);

  const DRAWER_WIDTH = 256;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box component="nav" sx={{ width: DRAWER_WIDTH }}>
        <Drawer
          variant="permanent"
          PaperProps={{ sx: { width: DRAWER_WIDTH } }}
        >
          <List
            disablePadding
            sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <Box sx={{ flexGrow: 0 }}>
              <NextLink href="/spaces">
                <ListItemButton type="heading">
                  <Logo />
                </ListItemButton>
              </NextLink>
              <NextLink href="/spaces">
                <ListItemButton type="category">
                  <ListItemIcon>
                    <HomeIcon />
                  </ListItemIcon>
                  <ListItemText>Dashboard</ListItemText>
                </ListItemButton>
              </NextLink>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <ListItem>
                {isManager ? 'Managed' : 'Joined'}&nbsp;spaces
              </ListItem>
              {spaces.map((s) => (
                <NextLink key={s.id} href={`/space/${s.id}`}>
                  <ListItemButton type="item" selected={s.id === spaceId}>
                    <ListItemText>{s.name}</ListItemText>
                  </ListItemButton>
                </NextLink>
              ))}
              <Divider />
              <NextLink href="/space/new">
                <ListItemButton type="category">
                  <ListItemIcon>
                    <AddIcon />
                  </ListItemIcon>
                  <ListItemText>Create new space</ListItemText>
                </ListItemButton>
              </NextLink>
            </Box>
            <Box sx={{ flexGrow: 0 }}>
              {!_userInfo.loading ? (
                !_userInfo.error && _userInfo.data ? (
                  <>
                    <Menu
                      anchorEl={accountMenuAnchorEl}
                      open={!!accountMenuAnchorEl}
                      onClose={handleAccountMenuClose}
                      onClick={handleAccountMenuClose}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                    >
                      <MenuItem
                        component={NextLinkComposed}
                        to="/change-password"
                      >
                        Change password
                      </MenuItem>
                      <MenuItem onClick={logout}>Logout</MenuItem>
                    </Menu>
                    <ListItemButton onClick={handleAccountMenuClick}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: stringToColor(
                              _userInfo.data.userInfo.fullName
                            ),
                          }}
                        >
                          {getAcronym(_userInfo.data.userInfo.fullName)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText>
                        {_userInfo.data.userInfo.fullName}
                      </ListItemText>
                    </ListItemButton>
                  </>
                ) : (
                  <ErrorDisplay error={_userInfo.error} />
                )
              ) : (
                <Loader />
              )}
            </Box>
          </List>
        </Drawer>
      </Box>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
};

export default DashboardLayout;
