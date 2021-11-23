import { observer } from 'mobx-react';
import { NextComponentType, NextPage, NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import nookies from 'nookies';

import { useAccessToken } from './useAccessToken';

const IS_SERVER = typeof window === 'undefined';

function withAuth<P, IP>(Page: NextPage<P, IP>) {
  const WithAuth: NextComponentType<NextPageContext, object, P> = observer(
    (props) => {
      const router = useRouter();
      const accessToken = useAccessToken();

      useEffect(() => {
        if (!accessToken.value) {
          if (!nookies.get()['refresh']) {
            router.replace('/login').catch((err) => {
              throw err;
            });
          }
        }
      }, [accessToken.value, router]);

      if (IS_SERVER) {
        return null;
      }

      return <Page {...props} />;
    }
  );

  WithAuth.getInitialProps = async (ctx) => {
    let pageProps = {};

    if (Page.getInitialProps) {
      pageProps = await Page.getInitialProps(ctx);
    }

    return pageProps;
  };

  return WithAuth;
}

export default withAuth;
