import { NextPage } from 'next';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { useQueryVar } from '../../../lib/utils/useQueryVar';
import withApollo from '../../../lib/utils/withApollo';
import {
  useSpaceInfoQuery,
  useUserInfoQuery,
} from '../../../__generated__/graphql';
import getBaseUrl from '../../../lib/utils/getBaseUrl';
import Navbar from '../../../components/Navbar';
import withAuth from '../../../lib/utils/withAuth';

type Props = {
  prettyBaseUrl: string;
  rawBaseUrl: string;
};

const SpacePage: NextPage<Props> = ({ prettyBaseUrl, rawBaseUrl }) => {
  const spaceId = useQueryVar('id') || '404';

  const userInfo = useUserInfoQuery();

  const spaceInfo = useSpaceInfoQuery({
    variables: { spaceId },
  });

  return (
    <Navbar>
      {!spaceInfo.loading ? (
        !spaceInfo.error && spaceInfo.data ? (
          <div>
            <h1>{spaceInfo.data.spaceInfo.name}</h1>
            <p>
              max bookings per day: {spaceInfo.data.spaceInfo.maxBookingsPerDay}
            </p>
            {!userInfo.loading ? (
              !userInfo.error && userInfo.data ? (
                userInfo.data.userInfo.roles[0].value === 'MANAGER' ? (
                  <div>
                    <div>
                      <CopyToClipboard
                        text={`${rawBaseUrl}/invite/${spaceInfo.data.spaceInfo.code}`}
                      >
                        <button>{`${prettyBaseUrl}/invite/${spaceInfo.data.spaceInfo.code}`}</button>
                      </CopyToClipboard>
                    </div>
                  </div>
                ) : null
              ) : (
                <p>{userInfo.error?.message}</p>
              )
            ) : (
              <p>loading...</p>
            )}
          </div>
        ) : (
          <p>{spaceInfo.error?.message}</p>
        )
      ) : (
        <p>loading...</p>
      )}
    </Navbar>
  );
};

SpacePage.getInitialProps = async (ctx) => {
  const { pretty, raw } = await Promise.resolve(getBaseUrl(ctx.req));
  return { prettyBaseUrl: pretty, rawBaseUrl: raw };
};

export default withApollo(withAuth(SpacePage));
