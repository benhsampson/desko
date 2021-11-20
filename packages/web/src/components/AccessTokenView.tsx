import { observer } from 'mobx-react';
import type { AccessToken } from '../lib/utils/useAccessToken';

type Props = {
  accessToken: AccessToken;
};

const AccessTokenView = observer(({ accessToken }: Props) => (
  <span>{accessToken.value}</span>
));

export default AccessTokenView;
