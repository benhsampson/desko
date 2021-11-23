import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import nookies from 'nookies';

import { useAccessToken } from '../../lib/utils/useAccessToken';
import { useQueryVar } from '../../lib/utils/useQueryVar';
import withApollo from '../../lib/utils/withApollo';
import { useJoinSpaceMutation } from '../../__generated__/graphql';
import AccessTokenView from '../../components/AccessTokenView';

const InvitePage = () => {
  const [stateErrors, setStateErrors] = useState<string[]>([]);

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
        .catch((e) => {
          throw e;
        });
      return;
    }

    const handler = async () => {
      const { errors, data } = await joinSpace({ variables: { code } });

      if (errors) return setStateErrors(errors.map((e) => e.message));
      if (data?.joinSpace.errors)
        return setStateErrors(data.joinSpace.errors.map((e) => e.message));

      if (data?.joinSpace.space)
        await router.push(`/space/${data.joinSpace.space.id}`);
    };

    handler().catch((e) => {
      console.error(e);
    });
  }, []);

  // const accessToken = useAccessToken();

  return (
    <div>
      <AccessTokenView accessToken={accessToken} />
      {stateErrors.length ? (
        <ul>
          {stateErrors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      ) : null}
      <p>joining...</p>
    </div>
  );
};

export default withApollo(InvitePage);
