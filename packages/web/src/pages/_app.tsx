import { AppProps } from 'next/app';
import AccessTokenView from '../components/AccessTokenView';
import { useAccessToken } from '../lib/AccessToken';

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
