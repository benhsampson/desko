import { useLogoutMutation } from '../../__generated__/graphql';
import { useAccessToken } from './useAccessToken';

export const useLogout = () => {
  const [logout] = useLogoutMutation();
  const accessToken = useAccessToken();

  return async () => {
    await logout();
    accessToken.clear();
  };
};
