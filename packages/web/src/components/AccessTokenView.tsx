import { observer } from 'mobx-react';
import { AccessToken } from '../lib/AccessToken';

type Props = {
  accessToken: AccessToken;
};

const AccessTokenView = observer(({ accessToken }: Props) => (
  <span>{accessToken.value}</span>
));

export default AccessTokenView;
