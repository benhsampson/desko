import { AppProps } from 'next/app';
import Link from 'next/link';

import AccessTokenView from '../components/AccessTokenView';
import { useAccessToken } from '../lib/utils/useAccessToken';

function App({ Component, pageProps }: AppProps) {
  const accessToken = useAccessToken();

  return (
    <>
      <AccessTokenView accessToken={accessToken} />
      <button onClick={() => accessToken.clear()}>clear access token</button>
      <Component {...pageProps} />
      <Link href="/login">login</Link>
      <Link href="/protected">protected</Link>
      <Link href="/change-password">change password</Link>
    </>
  );
}

export default App;
