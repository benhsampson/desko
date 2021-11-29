import { NextComponentType, NextPage, NextPageContext } from 'next';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  createHttpLink,
  from,
  InMemoryCache,
  NormalizedCacheObject,
  Observable,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { mergeDeep } from '@apollo/client/utilities';
import nookies from 'nookies';
import { ParsedUrlQuery } from 'querystring';

// import config from './config';
import { useAccessToken } from './useAccessToken';
import { authenticateWithRefreshToken } from './renewAccessToken';

type ApolloState = NormalizedCacheObject;

type WithApolloParams = {
  apolloClient: ApolloClient<ApolloState>;
  apolloState: ApolloState;
  query: ParsedUrlQuery;
};

type WithApolloContext = NextPageContext & WithApolloParams;

const SSR_MODE = typeof window === 'undefined';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
});

const authLink = new ApolloLink((operation, forward) => {
  const accessToken = useAccessToken()?.value;

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(accessToken && {
        Authorization: `Bearer ${accessToken}`,
      }),
    },
  }));

  return forward(operation);
});

const errorLink = onError(
  ({ networkError, graphQLErrors, operation, forward }) => {
    if (networkError) {
      console.error(`[Network Error]: ${networkError.message}`);
    }

    if (graphQLErrors) {
      switch (graphQLErrors[0].extensions.code) {
        case 'UNAUTHENTICATED':
          const oldRefreshToken = nookies.get()['refresh'];

          if (!oldRefreshToken) return;

          return new Observable((observer) => {
            authenticateWithRefreshToken(oldRefreshToken)
              .then((newAccessToken) => {
                operation.setContext(({ headers = {} }) => ({
                  headers: {
                    ...headers,
                    ...(newAccessToken && {
                      Authorization: `Bearer ${newAccessToken}`,
                    }),
                  },
                }));
              })
              .then(() =>
                forward(operation).subscribe({
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                })
              )
              .catch((err) => {
                console.log('[Observer error]', err);
                observer.error(err);
              });
          });
        default:
          return forward(operation);
      }
    }

    return;
  }
);

const createApolloClient = () =>
  new ApolloClient({
    ssrMode: SSR_MODE,
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
  });

let globalApolloClient: ApolloClient<ApolloState> | null;

function initApollo(initialState: ApolloState) {
  const apolloClient = globalApolloClient ?? createApolloClient();

  if (initialState) {
    const existingCache = apolloClient.extract();

    const data = mergeDeep(initialState, existingCache);

    apolloClient.cache.restore(data);
  }

  if (SSR_MODE) return apolloClient;

  if (!globalApolloClient) globalApolloClient = apolloClient;

  return apolloClient;
}

function initApolloInCtx(ctx: WithApolloContext) {
  const apolloClient = ctx.apolloClient ?? initApollo(ctx.apolloState);

  (
    apolloClient as ApolloClient<ApolloState> & {
      toJSON: () => { [key: string]: JSON } | null;
    }
  ).toJSON = () => null;

  ctx.apolloClient = apolloClient;

  return ctx;
}

function withApollo<P, IP>(Page: NextPage<P, IP>) {
  const WithApollo: NextComponentType<
    WithApolloContext,
    object,
    P & WithApolloParams
  > = (props) => {
    const client = props.apolloClient ?? initApollo(props.apolloState);

    return (
      <ApolloProvider client={client}>
        <Page {...props} />
      </ApolloProvider>
    );
  };

  WithApollo.displayName = `WithApollo${Page.displayName || 'Component'}`;

  WithApollo.getInitialProps = async (ctx) => {
    const { AppTree, query } = ctx;
    const { apolloClient } = initApolloInCtx(ctx);

    let pageProps = {};

    if (Page.getInitialProps) {
      pageProps = await Page.getInitialProps(ctx);
    }

    if (SSR_MODE) {
      if (ctx?.res?.writableEnded) {
        return pageProps;
      }

      try {
        const { getDataFromTree } = await import('@apollo/client/react/ssr');
        await getDataFromTree(
          <AppTree pageProps={{ ...pageProps, apolloClient }} />
        );
      } catch (error) {
        console.error(error);
      }
    }

    const apolloState = apolloClient.cache.extract();

    return {
      ...pageProps,
      apolloState,
      apolloClient: ctx.apolloClient,
      query,
    };
  };

  return WithApollo;
}

export default withApollo;
