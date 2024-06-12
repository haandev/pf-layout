import { useEffect, useState } from 'react';
import { Direction } from '../types';

export const useParentDirection = (ref: React.RefObject<Element>, parentMatch: string, defaultDirection = Direction.Horizontal) => {
  const [parentDirection, setParentDirection] = useState<Direction>(defaultDirection);

  useEffect(() => {
    const parent = ref.current?.closest(parentMatch);
    if (parent) {
      setParentDirection(parent.classList.contains('pf-vertical') ? Direction.Vertical : Direction.Horizontal);
    }
  }, [ref]);

  return parentDirection;
};
