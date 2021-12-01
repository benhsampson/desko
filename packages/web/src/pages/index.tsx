import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function IndexPage() {
  const router = useRouter();
  useEffect(
    () => {
      router.push('/spaces').catch((err) => {
        console.error(err);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return <></>;
}
