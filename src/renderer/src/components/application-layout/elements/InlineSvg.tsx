import React from 'react';
import { FC, useEffect, useState } from 'react';

export interface InlineSvgProps extends React.SVGProps<SVGSVGElement> {
  source: string | URL | Request;
}
const InlineSvg: FC<InlineSvgProps> = ({ source, style, className, ...props }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [viewBox, setViewBox] = useState<string>('0 0 24 24');

  const loader = async (url: string | URL | Request) => {
    if (!url) return null;
    const response = await fetch(url);
    let text = await response.text();
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/(\sfill=['"][^'"]*['"]|\sstroke=['"][^'"]*['"]|\sclass=['"][^'"]*['"])/gi, '');
    const host = document.createElement('div');
    host.innerHTML = text;
    const svg = host.querySelector('svg');
    if (!svg) return null;
    const attributes = Array.from(svg.attributes);
    const viewBox = svg.getAttribute('viewBox');
    if (viewBox) setViewBox(viewBox);
    attributes.forEach((attr) => {
      attr.name !== 'viewBox' && svg.removeAttribute(attr.name);
    });
    setSvgContent(svg.innerHTML);
    return null;
  };

  useEffect(() => {
    loader(source);
  }, [source]);
  return (
    <svg
      dangerouslySetInnerHTML={{ __html: svgContent }}
      viewBox={viewBox}
      height="1em"
      width="1em"
      fill="currentColor"
      className={className}
      style={style}
      {...props}
    />
  );
};

export default React.memo(InlineSvg);
