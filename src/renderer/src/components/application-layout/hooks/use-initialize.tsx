import { useEffect, useRef } from 'react';

export function useInitialize(fn: () => void): void {
  const onceUnmounted = useRef<boolean>(false); // Define the ref with a boolean type
  const fired = useRef<boolean>(false); // Define the ref with a boolean type
  useEffect(() => {
    if (onceUnmounted.current && !fired.current) {
      fn();
      fired.current = true;
    }
    return () => {
      onceUnmounted.current = true;
    };
  }, [fn]);
}
