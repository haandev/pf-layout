import { create } from 'zustand';
import { GisStore, LayerItem, LayerType } from './types';
import Map from 'ol/Map';
import View, { ViewOptions } from 'ol/View';
import { supabase } from '@renderer/services';
import { getProj4DefsByEpsg } from '@renderer/services/settings';
import { register } from 'ol/proj/proj4';
import GeoJSON from 'ol/format/GeoJSON';
import proj4 from 'proj4';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import ExtentInteraction from 'ol/interaction/Extent';
import { shiftKeyOnly } from 'ol/events/condition';
import Style, { StyleLike } from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
const layerSorter = (a: LayerItem, b: LayerItem) => {
  if (a.type === LayerType.Background) return -1;
  if (b.type === LayerType.Background) return 1;
  return 0;
};
export const useGisStore = create<GisStore>((set, get) => {
  const map = new Map();

  const extentInteraction = new ExtentInteraction({
    condition: shiftKeyOnly,
    boxStyle: new Style({
      stroke: new Stroke({
        width: 2,
        color: [255, 0, 0, 1],
        lineDash: [5, 5]
      })
    })
  });

  map.addInteraction(extentInteraction);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') extentInteraction.setExtent(undefined as any);
  });

  const addExtentPoints = () => {
    const extent = extentInteraction.getExtent();
    if (!extent) return;
    const Xs = [extent[0], extent[2]];
    const Ys = [extent[1], extent[3]];
    const XMax = Math.max(...Xs);
    const XMin = Math.min(...Xs);
    const YMax = Math.max(...Ys);
    const YMin = Math.min(...Ys);
    fetchPoints([XMin, YMin], [XMax, YMax]);
  };

  const zoomToExtent = () => {
    const extent = extentInteraction.getExtent();
    if (extent) get().view.fit(extent, { duration: 600 });
  };

  const hideLayer = (name: string) => {
    set((state) => {
      return {
        layers: state.layers.map((layer) => {
          if (layer.name === name) {
            return {
              ...layer,
              visible: false
            };
          }
          return layer;
        })
      };
    });
  };
  const removeLayer = (name: string) => {
    set((state) => {
      return {
        layers: state.layers.filter((layer) => layer.name !== name)
      };
    });
  };
  const showLayer = (name: string) => {
    set((state) => {
      return {
        layers: state.layers.map((layer) => {
          if (layer.name === name) {
            return {
              ...layer,
              visible: true
            };
          }
          return layer;
        })
      };
    });
  };
  const addLayer = (config: LayerItem) => {
    const layer = get().layers.find((layer) => layer.name === config.name);
    if (!layer)
      set((state) => {
        return {
          layers: [...state.layers, config].sort(layerSorter)
        };
      });
    else showLayer(config.name);
  };
  const setView = (view: View) => {
    map.setView(view);
    return set({ view });
  };

  //initialize first view from db

  const getSettings = async () => {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;
    return data[0];
  };
  const fetchPoints = async (min: [number, number], max: [number, number]) => {
    const { data: types } = await supabase.from('types').select('*');

    let { data: points } = await supabase
      .from('points')
      .select('*')
      .lt('x', max[0])
      .lt('y', max[1])
      .gt('x', min[0])
      .gt('y', min[1]);

    const featureIds = new Set(points?.map((p) => p.featureId));

    const { data: features } = await supabase.from('features').select('*').in('id', Array.from(featureIds));

    const collectionIds = new Set(features?.map((f) => f.collectionId));

    const { data: collections } = await supabase.from('collections').select('*').in('id', Array.from(collectionIds));

    const geojson = collections?.map((collection) => ({
      type: 'FeatureCollection',
      features: features
        ?.filter((f) => f.collectionId === collection.id)
        .map((feature) => {
          const featureType = types?.find((t) => t.id === feature.typeId);
          const featurePoints = points?.filter((p) => p.featureId === feature.id);
          const featureCoordinates = featurePoints?.map((p) => [p.x, p.y]);
          const coordinates =
            featureType?.geometry === 'Point'
              ? featureCoordinates?.[0]
              : featureType?.geometry === 'Polygon'
                ? [...(featureCoordinates || []), featureCoordinates?.[0]]
                : featureCoordinates;

          return {
            id: feature.id,
            type: 'Feature',
            geometry: {
              type: featureType?.geometry,
              coordinates: coordinates
            }
          };
        })
    }));

    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(geojson?.[0])
    });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: {
        'fill-color': ['string', ['get', 'COLOR'], '#eee'],
        'stroke-color': ['string', ['get', 'COLOR'], '#000'],
        'stroke-width': 2
      }
    });

    set((state) => {
      const layers = [...state.layers];
      collections?.forEach((collection) => {
        const foundLayer = layers.find((layer) => layer.name === collection.name);
        if (!foundLayer) {
          layers.push({
            layer: vectorLayer,
            name: String(collection.name),
            visible: true,
            type: LayerType.Constructed
          });
        } else Object.assign(foundLayer, { layer: vectorLayer, visible: true });
      });

      return { types: types || [], layers: layers.sort(layerSorter) };
    });
  };

  getSettings()
    .then((settings) => {
      const viewOptions: ViewOptions = {
        projection: `EPSG:${settings.epsg}`,
        center: [settings.centerX || 0, settings.centerY || 0],
        zoom: settings.zoom || 18
      };
      return { settings, viewOptions };
    })
    .then(async ({ settings, viewOptions }) => {
      const code = settings.epsg as number;
      let definition: string = '';
      const { data, error } = await supabase.from('epsg').select('definition').eq('code', code);
      if (error) throw error;
      if (Array.isArray(data) && data.length) definition = data[0].definition || '';
      else {
        const proj4def = await getProj4DefsByEpsg(code);
        const defArray = proj4def.split('"');
        const def = defArray[3];
        if (def) {
          definition = def;
          await supabase.from('epsg').upsert({ code, definition });
        }
      }
      proj4.defs(`EPSG:${code}`, definition);
      register(proj4);
      setView(new View(viewOptions));
    });

  return {
    map,
    getExtent: () => extentInteraction.getExtent(),
    layers: [],
    addLayer,
    hideLayer,
    removeLayer,
    showLayer,
    view: new View(),
    setView,
    types: [],
    fetchPoints,
    addExtentPoints,
    zoomToExtent
  };
});
