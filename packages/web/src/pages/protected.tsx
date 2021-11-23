import withApollo from '../lib/utils/withApollo';
import { useUserInfoQuery } from '../__generated__/graphql';
import AuthView from '../components/AuthView';
import { useAccessToken } from '../lib/utils/useAccessToken';
import withAuth from '../lib/utils/withAuth';

const ProtectedPage = () => {
  const { loading, error, data, refetch } = useUserInfoQuery({
    fetchPolicy: 'no-cache',
  });
  const accessToken = useAccessToken();

  return (
    <div>
      <AuthView accessToken={accessToken} />
      {!loading ? (
        !error && data ? (
          <div>
            <p>{JSON.stringify(data)}</p>
            <button onClick={() => refetch()}>refetch</button>
          </div>
        ) : (
          <p>{error?.message || 'Error'}</p>
        )
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default withApollo(withAuth(ProtectedPage));
