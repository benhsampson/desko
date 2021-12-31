import React, { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton as MuiListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  styled,
  Toolbar,
  useTheme,
} from '@mui/material';
import NextLink from 'next/link';
import useMediaQuery from '@mui/material/useMediaQuery';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MenuIcon from '@mui/icons-material/Menu';

import Logo from './Logo';
import {
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
        fontWeight: 'bolder',
      }
    : type === 'item'
    ? {
        padding: theme.spacing(0.25, 4),
        color: theme.palette.text.secondary,
      }
    : {}),
}));

type Props = {
  openByDefault?: boolean;
  cancelBorder?: boolean;
};

const DashboardLayout: React.FC<Props> = ({
  children,
  openByDefault,
  cancelBorder,
}) => {
  const logout = useLogout();
  const spaceId = useQueryVar('id');

  const _userInfo = useUserInfoQuery();
  const _managerSpaces = useManagerSpacesQuery();
  const _joinedSpaces = useJoinedSpacesQuery();

  const isManager =
    _userInfo.data?.userInfo.roles.findIndex((r) => r.value === 'MANAGER') !=
    -1;

  // useEffect(() => {
  //   const handler = async () => {
  //     const userInfo = await _userInfo.refetch();

  //     if (!userInfo.error && userInfo.data) {
  //       switch (userInfo.data.userInfo.roles[0].value) {
  //         case 'MANAGER':
  //           setIsManager(true);

  //           const managerSpaces = await _managerSpaces.refetch();

  //           if (!managerSpaces.error && managerSpaces.data) {
  //             setSpaces(managerSpaces.data.managerSpaces);
  //           }

  //           break;
  //         case 'USER':
  //           const joinedSpaces = await _joinedSpaces.refetch();

  //           if (!joinedSpaces.error && joinedSpaces.data) {
  //             setSpaces(joinedSpaces.data.joinedSpaces);
  //           }

  //           break;
  //         default:
  //           break;
  //       }
  //     }
  //   };

  //   handler().catch((err) => {
  //     console.error(err);
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const [accountMenuAnchorEl, setAccountMenuAnchorEl] =
    useState<HTMLElement | null>(null);

  const handleAccountMenuClick = (event: React.MouseEvent<HTMLElement>) =>
    setAccountMenuAnchorEl(event.currentTarget);
  const handleAccountMenuClose = () => setAccountMenuAnchorEl(null);

  const [drawerAnchorEl, setDrawerAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const handleOpenDrawer = (ev: React.MouseEvent<HTMLElement>) =>
    setDrawerAnchorEl(ev.currentTarget);
  const handleCloseDrawer = () => setDrawerAnchorEl(null);
  const isDrawerOpen = !!drawerAnchorEl;

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const HEADER_HEIGHT_XS = 56;
  const HEADER_HEIGHT_SM = 64;
  const DRAWER_WIDTH = 256;

  return (
    <Box sx={{ display: matches ? 'block' : 'flex', minHeight: '100vh' }}>
      {matches && (
        <Box sx={{ height: { xs: HEADER_HEIGHT_XS, sm: HEADER_HEIGHT_SM } }}>
          <AppBar color="default" variant="outlined" elevation={0}>
            <Toolbar>
              <IconButton
                onClick={handleOpenDrawer}
                edge="start"
                aria-label="menu"
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <Logo />
            </Toolbar>
          </AppBar>
        </Box>
      )}
      <Box
        component="nav"
        sx={{ width: DRAWER_WIDTH, ...(cancelBorder && { mr: '-1px' }) }}
      >
        <Drawer
          open={isDrawerOpen}
          onClose={handleCloseDrawer}
          variant={!openByDefault && matches ? 'temporary' : 'permanent'}
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
              {isManager ? (
                <>
                  <ListItem>
                    <ListItemText>Managed spaces</ListItemText>
                  </ListItem>
                  {!_managerSpaces.error ? (
                    !_managerSpaces.loading ? (
                      _managerSpaces.data?.managerSpaces.map((s) => (
                        <NextLink key={s.id} href={`/space/${s.id}`}>
                          <ListItemButton
                            type="item"
                            selected={s.id === spaceId}
                          >
                            <ListItemText>{s.name}</ListItemText>
                          </ListItemButton>
                        </NextLink>
                      ))
                    ) : (
                      <Loader />
                    )
                  ) : (
                    <ErrorDisplay error={_managerSpaces.error} />
                  )}
                  <NextLink href="/space/new">
                    <ListItemButton type="category">
                      <ListItemIcon>
                        <AddIcon />
                      </ListItemIcon>
                      <ListItemText>Create new space</ListItemText>
                    </ListItemButton>
                  </NextLink>
                </>
              ) : null}
              <>
                {!_joinedSpaces.error ? (
                  !_joinedSpaces.loading ? (
                    _joinedSpaces.data?.joinedSpaces.length ? (
                      <>
                        <ListItem>
                          <ListItemText>Joined spaces</ListItemText>
                        </ListItem>
                        {_joinedSpaces.data.joinedSpaces.map((s) => (
                          <NextLink key={s.id} href={`/space/${s.id}`}>
                            <ListItemButton
                              type="item"
                              selected={s.id === spaceId}
                            >
                              <ListItemText>{s.name}</ListItemText>
                            </ListItemButton>
                          </NextLink>
                        ))}
                      </>
                    ) : null
                  ) : (
                    <Loader />
                  )
                ) : (
                  <ErrorDisplay error={_joinedSpaces.error} />
                )}
              </>
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
                      {accountMenuAnchorEl ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
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
