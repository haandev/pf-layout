import { useGisStore } from '@renderer/stores/gis/gis-store';
import { useEffect, useRef } from 'react';
import 'ol/ol.css';
const OpenLayersPage = () => {
  const gis = useGisStore();
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gis.map.setTarget(hostRef.current!);
  }, []);

  useEffect(() => {
    gis.map.setLayers(gis.layers.filter((layer) => layer.visible).map((layer) => layer.layer));
  }, [gis.layers]);

  return (
    <div
      style={{ width: '100%', height: '100%', backgroundColor: 'white' }}
      ref={hostRef}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    ></div>
  );
};

export default OpenLayersPage;
