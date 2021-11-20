import { observer } from 'mobx-react';
import { AccessTokenObserverProps } from '../lib/types/AccessTokenObserverProps';

const AccessTokenView = observer(
  ({ accessToken }: AccessTokenObserverProps) => (
    <>
      <p>{accessToken.value}</p>
      <p>{accessToken.expiry?.toLocaleTimeString()}</p>
    </>
  )
);

export default AccessTokenView;
