import { useRouter } from 'next/router';
import { useMemo } from 'react';

export const useQueryVar = (key: string) => {
  const { query } = useRouter();
  const val = query[key];
  const _val = useMemo(
    () => (typeof val === 'string' ? val : val?.length ? val[0] : undefined),
    [val]
  );
  return _val;
};
