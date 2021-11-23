import { useEffect, useState } from 'react';
import Link from 'next/link';

import withApollo from '../lib/utils/withApollo';

import {
  useUserInfoQuery,
  useManagerSpacesQuery,
  useJoinedSpacesQuery,
  Space,
} from '../__generated__/graphql';
import Navbar from '../components/Navbar';
import withAuth from '../lib/utils/withAuth';

interface SharedSpace extends Partial<Space> {
  id: string;
  name: string;
  maxBookingsPerDay: number;
  code?: string;
}

const SpacesPage = () => {
  const [spaces, setSpaces] = useState<SharedSpace[]>([]);
  const [isManager, setIsManager] = useState(false);

  const _userInfo = useUserInfoQuery({ skip: true });
  const _managerSpaces = useManagerSpacesQuery({ skip: true });
  const _joinedSpaces = useJoinedSpacesQuery({ skip: true });

  useEffect(() => {
    const handler = async () => {
      const userInfo = await _userInfo.refetch();

      if (!userInfo.error && userInfo.data) {
        switch (userInfo.data.userInfo.roles[0].value) {
          case 'MANAGER':
            setIsManager(true);

            const managerSpaces = await _managerSpaces.refetch();

            if (!managerSpaces.error && managerSpaces.data) {
              setSpaces(managerSpaces.data.managerSpaces);
            }

            break;
          case 'USER':
            const joinedSpaces = await _joinedSpaces.refetch();

            if (!joinedSpaces.error && joinedSpaces.data) {
              setSpaces(joinedSpaces.data.joinedSpaces);
            }

            break;
          default:
            break;
        }
      }
    };

    handler().catch((err) => {
      console.error(err);
    });
  }, [_userInfo, _managerSpaces, _joinedSpaces]);

  return (
    <Navbar>
      <ul>
        {spaces.map((s) => (
          <li key={s.id}>
            <Link href={`/space/${s.id}`}>{s.name}</Link>
            {isManager && <Link href={`/space/${s.id}/edit`}>edit</Link>}
          </li>
        ))}
      </ul>
      {isManager && <Link href="/space/new">new space</Link>}
    </Navbar>
  );
};

export default withApollo(withAuth(SpacesPage));
