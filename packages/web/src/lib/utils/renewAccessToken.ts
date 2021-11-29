import { useAccessToken } from './useAccessToken';
// import config from './config';

type RefreshTokenResponse = {
  errors?: [];
  data?: {
    refreshToken: {
      accessToken?: string;
      accessTokenExpiry?: string;
    };
  };
};

export const authenticateWithRefreshToken = (oldRefreshToken: string) =>
  fetch(process.env.NEXT_PUBLIC_API_URL || '', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      query: `
        mutation RefreshToken($refreshToken: String!) {
          refreshToken(input: { refreshToken: $refreshToken }) {
              accessToken
              accessTokenExpiry
          }
        }
      `,
      variables: {
        refreshToken: oldRefreshToken,
      },
    }),
  })
    .then((res) => res.json() as RefreshTokenResponse)
    .then(({ errors, data }) => {
      if (
        errors ||
        !data?.refreshToken.accessToken ||
        !data?.refreshToken.accessTokenExpiry
      ) {
        return null;
      }

      useAccessToken().set(
        data.refreshToken.accessToken,
        new Date(data.refreshToken.accessTokenExpiry)
      );

      return data.refreshToken.accessToken;
    });
