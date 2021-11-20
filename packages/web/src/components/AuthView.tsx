import { observer } from 'mobx-react';

import { AccessTokenObserverProps } from '../lib/types/AccessTokenObserverProps';
import { useLogout } from '../lib/utils/useLogout';

const AuthView = observer(({ accessToken }: AccessTokenObserverProps) => {
  const logout = useLogout();

  return (
    <div>
      <button onClick={logout} disabled={!accessToken.value}>
        logout
      </button>
    </div>
  );
});

export default AuthView;
