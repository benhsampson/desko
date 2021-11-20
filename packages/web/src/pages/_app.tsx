import { AppProps } from 'next/app';
import Link from 'next/link';

import AccessTokenView from '../components/AccessTokenView';
import { useAccessToken } from '../lib/utils/useAccessToken';

function App({ Component, pageProps }: AppProps) {
  const accessToken = useAccessToken();

  return (
    <>
      <AccessTokenView accessToken={accessToken} />
      <Component {...pageProps} />
      <Link href="/login">login</Link>
      <Link href="/protected">protected</Link>
    </>
  );
}

export default App;
