import React from 'react';
import { Box, ButtonBase, Container, styled, Typography } from '@mui/material';

import Logo from './Logo';
import { NextLinkComposed } from './Link';

type Props = {
  mainHeading: string;
  subHeading: string;
  headerContent?: React.ReactNode;
};

const Header = styled('header')(({ theme }) => ({
  top: 0,
  zIndex: theme.zIndex.appBar,
  lineHeight: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'baseline',
  position: 'absolute',
  padding: theme.spacing(3),
  justifyContent: 'space-between',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3, 5, 0),
  },
}));

const Content = styled('div')(({ theme }) => ({
  maxWidth: 550,
  margin: '0 auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0),
}));

const AuthLayout: React.FC<Props> = ({
  children,
  mainHeading,
  subHeading,
  headerContent,
}) => {
  return (
    <Box>
      <Header>
        <ButtonBase component={NextLinkComposed} to="/">
          <Logo />
        </ButtonBase>
        {headerContent && (
          <Typography variant="body2">{headerContent}</Typography>
        )}
      </Header>
      <Container>
        <Content>
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" gutterBottom>
              {mainHeading}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              {subHeading}
            </Typography>
          </Box>
          {children}
        </Content>
      </Container>
    </Box>
  );
};

export default AuthLayout;
