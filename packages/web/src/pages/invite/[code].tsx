import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import nookies from 'nookies';

import { useAccessToken } from '../../lib/utils/useAccessToken';
import { useQueryVar } from '../../lib/utils/useQueryVar';
import withApollo from '../../lib/utils/withApollo';
import { useJoinSpaceMutation, UserError } from '../../__generated__/graphql';
import ErrorList from '../../components/ErrorList';

const InvitePage = () => {
  const [stateErrors, setStateErrors] = useState<UserError[]>([]);

  const code = useQueryVar('code');

  const [joinSpace] = useJoinSpaceMutation();

  const accessToken = useAccessToken();

  const router = useRouter();

  useEffect(() => {
    // TODO: Check if null in getInitialProps()
    if (!code) return;

    if (!accessToken.value && !nookies.get()['refresh']) {
      console.log('?');
      router
        .replace({ pathname: '/register', ...(code && { query: { code } }) })
        .catch((err) => {
          throw err;
        });
      return;
    }

    const handler = async () => {
      const { errors, data } = await joinSpace({ variables: { code } });

      if (errors) return console.error(errors);

      if (data?.joinSpace.errors) return setStateErrors(data.joinSpace.errors);

      if (data?.joinSpace.space)
        await router.push(`/space/${data.joinSpace.space.id}`);
    };

    handler().catch((e) => {
      console.error(e);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <ErrorList errors={stateErrors} />
      <p>joining...</p>
    </div>
  );
};

export default withApollo(InvitePage);
