import { AppProps } from 'next/app';

import AccessTokenView from '../components/AccessTokenView';
import { useAccessToken } from '../lib/utils/useAccessToken';

function App({ Component, pageProps }: AppProps) {
  const accessToken = useAccessToken();

  return (
    <>
      <AccessTokenView accessToken={accessToken} />
      <Component {...pageProps} />
    </>
  );
}

export default App;
