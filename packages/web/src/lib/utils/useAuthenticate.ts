import { useRouter } from 'next/router';

import { useAccessToken } from './useAccessToken';

export const useAuthenticate = () => {
  const router = useRouter();
  const accessToken = useAccessToken();

  return async (newAccessToken: string) => {
    accessToken.set(newAccessToken);
    await router.push('/protected');
  };
};
