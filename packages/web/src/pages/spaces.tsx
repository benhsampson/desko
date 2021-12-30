import { Box, Typography } from '@mui/material';
import withApollo from '../lib/utils/withApollo';
import withAuth from '../lib/utils/withAuth';
import DashboardLayout from '../components/DashboardLayout';
import { useUserInfoQuery } from '../__generated__/graphql';
import Loader from '../components/Loader';

const SpacesPage = () => {
  const { data, loading } = useUserInfoQuery();

  const isManager =
    data?.userInfo.roles.findIndex((r) => r.value === 'MANAGER') !== -1;

  return (
    <DashboardLayout openByDefault>
      <Box sx={{ p: 4 }}>
        {!loading ? (
          <>
            <Typography variant="h5" gutterBottom>
              Get started with Desko
            </Typography>
            {isManager ? (
              <>
                <Typography gutterBottom>
                  {'Click "+ Create new space" to get started. '}
                </Typography>
                <Typography>
                  Then, click the invite button to generate a unique URL for the
                  space and send it to people who need to book desks.
                </Typography>
              </>
            ) : (
              <>
                <Typography gutterBottom>
                  Click one of your joined spaces to book desks.
                </Typography>
                <Typography gutterBottom>
                  If you don&apos;t see the space on the left of the screen, ask
                  your space manager for a link, then copy and paste in your
                  browser.
                </Typography>
                <Typography gutterBottom>
                  Then, click any date on the calendar to book a desk for the
                  day, except for days before today.
                </Typography>
                <Typography>
                  You can switch between day and month views using the
                  &quot;DAY&quot; and &quot;MONTH&quot; buttons.
                </Typography>
              </>
            )}
          </>
        ) : (
          <Loader />
        )}
      </Box>
    </DashboardLayout>
  );
};

export default withApollo(withAuth(SpacesPage));
