import withApollo from '../lib/utils/withApollo';
import { useGetStatusQuery } from '../__generated__/graphql';

function StatusPage() {
  const { loading, error, data } = useGetStatusQuery({ ssr: true });

  return !loading ? (
    !error && data ? (
      <p>{JSON.stringify(data)}</p>
    ) : (
      <p>{error?.message || 'Error'}</p>
    )
  ) : (
    <p>Loading..</p>
  );
}

export default withApollo(StatusPage);
