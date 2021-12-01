import withApollo from '../lib/utils/withApollo';
import withAuth from '../lib/utils/withAuth';
import DashboardLayout from '../components/DashboardLayout';

const SpacesPage = () => {
  return <DashboardLayout />;
};

export default withApollo(withAuth(SpacesPage));
