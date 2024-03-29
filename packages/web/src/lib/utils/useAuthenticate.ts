import { useRouter } from 'next/router';

import { useAccessToken } from './useAccessToken';

export const useAuthenticate = () => {
  const router = useRouter();
  const accessToken = useAccessToken();

  return async (
    newAccessToken: string,
    newAccessTokenExpiry: Date,
    redirectTo = '/spaces'
  ) => {
    accessToken.set(newAccessToken, newAccessTokenExpiry);
    await router.push(redirectTo);
  };
};
