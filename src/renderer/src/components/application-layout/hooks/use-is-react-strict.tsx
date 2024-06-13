import { useEffect, useRef } from 'react';

export function useIsReactStrict(): boolean {
  const count = useRef<number>(0);

  useEffect(() => {
    count.current++;
  }, []);

  return count.current > 1;
}
