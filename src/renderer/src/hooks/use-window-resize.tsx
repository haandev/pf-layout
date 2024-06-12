import { useState, useEffect } from 'react';

interface WindowSizeOptions {
  onResize?: (width: number, height: number) => void;
}

interface WindowSize {
  width: number;
  height: number;
}

function useWindowResize(options?: WindowSizeOptions): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    function handleResize() {
      const { innerWidth, innerHeight } = window;
      options?.onResize?.(innerWidth, innerHeight);

      setWindowSize({
        width: innerWidth,
        height: innerHeight
      });
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [options]);
  return windowSize;
}

export default useWindowResize;
