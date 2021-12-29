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
                <Typography>
                  {'Click "+ Create new space" to get started.'}
                </Typography>
              </>
            ) : (
              <Typography>
                {
                  'Click one of your joined spaces to get started or ask your space manager for a link.'
                }
              </Typography>
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
