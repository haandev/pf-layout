import { useApp } from '@renderer/stores/app-store';
import { useGisStore } from '@renderer/stores/gis/gis-store';
import { XMarkIcon } from '@heroicons/react/24/solid';

import { LayerType } from '@renderer/stores/gis/types';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

export const LayersPanel = () => {
  const gis = useGisStore();
  const addOsmLayer = () => {
    gis.addLayer({
      layer: new TileLayer({
        source: new OSM({
          url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
          attributions: 'Google'
        })
      }),
      name: 'Sokak görünümü',
      visible: true,
      type: LayerType.Background
    });
  };
  return (
    <div>
      {gis.layers.map((layer) => (
        <div key={layer.name} className="flex items-center justify-between w-full space-x-2">
          <label className="flex-1">
            <input
              className="mr-2"
              type="checkbox"
              checked={layer.visible}
              onChange={() => (layer.visible ? gis.hideLayer(layer.name) : gis.showLayer(layer.name))}
            />
            <span className="flex-1">{layer.name}</span>
          </label>
          <button onClick={() => gis.removeLayer(layer.name)}>
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button className="bg-blue-500 text-white p-2 rounded" onClick={addOsmLayer}>
        arkaplan ekle
      </button>

      <button className="bg-blue-500 text-white p-2 rounded" onClick={gis.addExtentPoints}>
        noktaları ekle
      </button>

      <button className="bg-blue-500 text-white p-2 rounded" onClick={gis.zoomToExtent}>
        Extent'e git
      </button>
    </div>
  );
};
