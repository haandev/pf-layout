import { forwardRef, useRef } from 'react';
import { useBoxResize } from '../';
import { UseBoxResizeHandler } from '../hooks/use-box-resize';

const ResizeBox = forwardRef(
  (
    props: {
      handler: UseBoxResizeHandler;
      safetyMargins?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      };
    },
    forwardedRef
  ) => {
    const ref = useRef<HTMLDivElement>(null);
    const parent = ref.current?.parentElement || null;
    const parentRef = useRef<HTMLElement | null>(parent);
    parentRef.current = parent;

    const box = useBoxResize<HTMLDivElement>({
      ref: forwardedRef as any,
      handler: props.handler,
      safetyMargins: props.safetyMargins
    });
    return (
      <>
        <div className="pf-resize-box" ref={ref} />
        <div ref={box.left} className="pf-resize pf-resize-l" />
        <div ref={box.right} className="pf-resize pf-resize-r" />
        <div ref={box.top} className="pf-resize pf-resize-t" />
        <div ref={box.bottom} className="pf-resize pf-resize-b" />
        <div ref={box.topLeft} className="pf-resize pf-resize-tl" />
        <div ref={box.topRight} className="pf-resize pf-resize-tr" />
        <div ref={box.bottomLeft} className="pf-resize pf-resize-bl" />
        <div ref={box.bottomRight} className="pf-resize pf-resize-br" />
      </>
    );
  }
);

export default ResizeBox;
