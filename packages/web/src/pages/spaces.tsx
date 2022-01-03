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
    <DashboardLayout>
      <Box sx={{ p: 4 }}>
        {!loading ? (
          <>
            <Typography variant="h5" gutterBottom>
              Get started with Desko
            </Typography>
            {isManager ? (
              <>
                <Typography gutterBottom>
                  {
                    'As a space manager; Click "+ Create new space" to get started. '
                  }
                </Typography>
                <Typography gutterBottom>
                  Then, click the &quot;INVITE USERS&quot; button to generate a
                  unique URL for the space.
                </Typography>
                <Typography gutterBottom>
                  Copy the link and send it to people who need to book desks.
                </Typography>
                <br />
              </>
            ) : null}
            <Typography gutterBottom>
              As a space user; Click one of your joined spaces to book desks.
            </Typography>
            <Typography gutterBottom>
              If you don&apos;t see the space on the left of the screen, ask
              your space manager for a link, then copy and paste in your
              browser.
            </Typography>
            <Typography gutterBottom>
              Then, click any date on the calendar to book a desk for the day,
              except for days before today.
            </Typography>
            <Typography>
              You can switch between day and month views using the
              &quot;DAY&quot; and &quot;MONTH&quot; buttons.
            </Typography>
          </>
        ) : (
          <Loader />
        )}
      </Box>
    </DashboardLayout>
  );
};

export default withApollo(withAuth(SpacesPage));
