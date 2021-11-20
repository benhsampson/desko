import withApollo from '../lib/utils/withApollo';
import { useUserInfoQuery } from '../__generated__/graphql';

const ProtectedPage = () => {
  const { loading, error, data, refetch } = useUserInfoQuery({ ssr: false });

  return !loading ? (
    !error && data ? (
      <>
        <p>{JSON.stringify(data)}</p>
        <button onClick={() => refetch()}>refetch</button>
      </>
    ) : (
      <p>{error?.message || 'Error'}</p>
    )
  ) : (
    <p>Loading...</p>
  );
};

export default withApollo(ProtectedPage);
