import { useEffect, useState } from 'react';

export default class Dummy {
  static async getEventSlots() {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return [
      {
        date: '2021-12-20',
        events: Array.from({ length: 10 }, (_, i) => ({ name: `${i}` })),
      },
    ];
  }
}

export const useDummyEvents = () => {
  const [response, setResponse] = useState<{
    loading: boolean;
    data?: Awaited<ReturnType<typeof Dummy.getEventSlots>>;
  }>({ loading: false });
  async function fetch() {
    setResponse({ loading: true });
    const data = await Dummy.getEventSlots();
    setResponse({ loading: false, data });
  }
  useEffect(() => {
    void fetch();
  }, []);
  return { ...response, refetch: fetch };
};
