import { observer } from 'mobx-react';
import Link from 'next/link';

import { useLogout } from '../lib/utils/useLogout';
import { useAccessToken } from '../lib/utils/useAccessToken';

type Props = { children?: React.ReactNode };

const Navbar = observer(({ children }: Props) => {
  const logout = useLogout();
  const accessToken = useAccessToken();

  return (
    <div>
      {accessToken.value ? (
        <div>
          <button onClick={logout}>logout</button>
          <br />
          <Link href="/spaces">spaces</Link>
          <br />
          <Link href="/change-password">change password</Link>
        </div>
      ) : (
        <>
          <Link href="/login">login</Link>
          <br />
          <Link href="/register">register</Link>
        </>
      )}
      {children}
    </div>
  );
});

export default Navbar;
