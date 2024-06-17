import * as makerjs from 'makerjs';
import * as React from 'react';
import { create } from 'zustand';
import { getCursorCoordinates, naturalFit, renderOptions, screenFit } from '../geometry';
import convert from 'react-from-dom';

type ContentState = typeof initialContent;
type ViewState = typeof initialView;

interface SVGProps {
  width: string;
  height: string;
  viewBox: string;
  xmlns: string;
  children: any[];
}

const initialContent: {
  measurement: makerjs.IMeasureWithCenter | null;
  model: makerjs.IModel | null;
  svgNode: React.ReactElement<SVGProps, any> | null;
} = {
  measurement: null,
  model: null,
  svgNode: null
};

type OptionState = {
  fitOnScreen: boolean;
  showGrid: boolean;
  showPathNames: boolean;
  showPathFlow: boolean;
  yDirection: 'naturalUp' | 'computerScreenDow';
  unitString?: string;
};

const initialOptions: OptionState = {
  fitOnScreen: false,
  showGrid: true,
  showPathNames: false,
  showPathFlow: false,
  yDirection: 'naturalUp',
  unitString: undefined
};

const initialView: {
  cursor: makerjs.IPoint;
  isMouseDown: boolean;
  origin: makerjs.IPoint;
  panOffset: makerjs.IPoint;
  scale: number;
  viewOffset: makerjs.IPoint;
  viewSize: number[];
} = {
  cursor: [0, 0],
  isMouseDown: false,
  origin: [0, 0],
  panOffset: [0, 0],
  scale: 1,
  viewOffset: [0, 0],
  viewSize: [0, 0]
};

export { ContentState, ViewState, OptionState, SVGProps };

//experimental zustand store for blueprint

export interface BlueprintStore {
  content: ContentState;
  options: OptionState;
  view: ViewState;
  storeModel: (model: makerjs.IModel | string | null) => void;
  toggleFitScreen: () => void;
  toggleGrid: () => void;
  togglePathNames: () => void;
  togglePathFlow: () => void;
  setViewMeasurements: (point: number[], size: number[]) => void;
  mouseWheel: (delta: number) => void;
  mouseMove: (point: number[]) => void;
  mouseDown: (point: number[]) => void;
  mouseUp: (point: number[]) => void;
}

function isMakerModel(object: string | makerjs.IModel): object is makerjs.IModel {
  return (object as makerjs.IModel).paths !== undefined || (object as makerjs.IModel).models !== undefined;
}
const wheelZoomDelta = 0.1;
const p = makerjs.point;

export const createBlueprintStore = (options?: Partial<OptionState>) =>
  create<BlueprintStore>((set) => ({
    content: initialContent,
    options: { ...initialOptions, ...(options || {}) },
    view: initialView,
    storeModel: (model) =>
      set((state) => {
        var svgString: string | null = null;
        if (model && isMakerModel(model)) {
          let options = renderOptions(state.view, makerjs.measure.modelExtents(model));
          svgString = makerjs.exporter.toSVG(model, options);
        } else if (model && typeof model === 'string') {
          svgString = model;
        }
        const svgNode = svgString ? (convert(svgString) as React.ReactElement<SVGProps, any>) : null;
        const measurement = model && isMakerModel(model) ? makerjs.measure.modelExtents(model) : null;
        const newContent = {
          measurement: measurement,
          model: model && isMakerModel(model) ? model : null,
          svgNode: svgNode
        };

        const fittingState = { ...state, content: newContent };
        // don't refit natural scale if we already had a previous model, so that the view doesn't change
        const needsRefit = state.content.model === null;
        return {
          view: state.options.fitOnScreen
            ? screenFit(fittingState)
            : needsRefit
              ? naturalFit(fittingState)
              : state.view,
          content: newContent
        };
      }),
    toggleFitScreen: () => {
      return set((state) => {
        const newFitOnScreen = !state.options.fitOnScreen;
        return {
          options: { ...state.options, fitOnScreen: newFitOnScreen },
          view: newFitOnScreen ? screenFit(state) : naturalFit(state)
        };
      });
    },
    toggleGrid: () => set((state) => ({ options: { ...state.options, showGrid: !state.options.showGrid } })),
    togglePathNames: () =>
      set((state) => ({ options: { ...state.options, showPathNames: !state.options.showPathNames } })),
    togglePathFlow: () =>
      set((state) => ({ options: { ...state.options, showPathFlow: !state.options.showPathFlow } })),
    setViewMeasurements: (point, size) =>
      set((state) => ({ view: { ...state.view, viewOffset: point, viewSize: size } })),
    mouseWheel: (delta) =>
      set((state) => {
        const sign = delta > 0 ? -1 : 1;
        const newScale = state.view.scale * (1 + sign * wheelZoomDelta);
        const zoomRatio = newScale / state.view.scale;
        const cursorCoo = getCursorCoordinates(state.view);
        const previousScaledCenter = p.scale(cursorCoo, state.view.scale);
        const currentScaledCenter = p.scale(previousScaledCenter, zoomRatio);
        const centerPointDiff = p.subtract(previousScaledCenter, currentScaledCenter);
        const newOptions =
          state.options.fitOnScreen && newScale !== 1 ? { ...state.options, fitOnScreen: false } : state.options;
        return {
          content: state.content,
          options: newOptions,
          view: { ...state.view, scale: newScale, panOffset: p.add(state.view.panOffset, centerPointDiff) }
        };
      }),
    mouseDown: (point) =>
      set((state) => {
        const newCursor = p.subtract(point, state.view.viewOffset);
        return { view: { ...state.view, isMouseDown: true, cursor: newCursor } };
      }),
    mouseMove: (point) =>
      set((state) => {
        const newCursor = p.subtract(point, state.view.viewOffset);
        // console.log(`viewOffset: ${view.viewOffset}, newCursor: ${newCursor}`)
        var panDelta: makerjs.IPoint = [0, 0];
        if (state.view.isMouseDown) panDelta = p.subtract(newCursor, state.view.cursor);
        return {
          view: { ...state.view, cursor: newCursor, panOffset: p.add(state.view.panOffset, panDelta) }
        };
      }),
    mouseUp: (point) =>
      set((state) => {
        if (state.view.isMouseDown) {
          const newCursor = p.subtract(point, state.view.viewOffset);
          return { view: { ...state.view, isMouseDown: false, cursor: newCursor } };
        }
        return state;
      })
  }));
