import { Database } from '@renderer/services/supabase';
import { Extent } from 'ol/extent';
import Layer from 'ol/layer/Layer';
import Map from 'ol/Map';
import View from 'ol/View';

export enum LayerType {
  Background,
  Constructed,
  Draft
}
export type LayerItem = {
  layer: Layer;
  name: string;
  visible: boolean;
  type: LayerType;
};

export type GeometryType = Database['public']['Enums']['GeometryType'];
export type FeatureType = Database['public']['Tables']['types']['Row'];
export interface GisStore {
  map: Map;
  getExtent: () => Extent | undefined;

  //layers and layer operations
  layers: LayerItem[];
  addLayer: (config: LayerItem) => void;
  hideLayer: (name: string) => void;
  removeLayer: (name: string) => void;
  showLayer: (name: string) => void;

  //view and view operations
  view: View;
  setView: (view: View) => void;

  //types
  types: FeatureType[];
  fetchPoints: (min: [number, number], max: [number, number]) => void;
  addExtentPoints: () => void;
  zoomToExtent: () => void;
}
