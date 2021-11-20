import { NextComponentType, NextPage, NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { useAccessToken } from '../AccessToken';

const IS_SERVER = typeof window === 'undefined';

function withAuth<P, IP>(Page: NextPage<P, IP>) {
  const WithAuth: NextComponentType<NextPageContext, IP, P> = (props) => {
    const router = useRouter();
    const accessToken = useAccessToken();

    if (IS_SERVER) {
      return null;
    }

    if (!accessToken.value) {
      router
        .replace('/login')
        .then(() => {
          return null;
        })
        .catch((err) => {
          throw err;
        });
      return null;
    }

    return <Page {...props} />;
  };

  return WithAuth;
}

export default withAuth;
