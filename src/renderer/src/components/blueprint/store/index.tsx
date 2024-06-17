import * as React from 'react';
import { useEffect, createContext, FunctionComponent } from 'react';
import * as makerjs from 'makerjs';

import { BlueprintStore, createBlueprintStore, OptionState } from './state';
import { StoreApi, UseBoundStore } from 'zustand';
import { useStoreWithEqualityFn } from 'zustand/traditional';

type ContextValue = UseBoundStore<StoreApi<BlueprintStore>>;
const store = createContext<ContextValue | null>(null);

export type ProviderProps = React.PropsWithChildren & {
  options?: Partial<OptionState>;
  model?: makerjs.IModel | string;
};

export const StateProvider: FunctionComponent<ProviderProps> = ({ options, model, children }) => {
  const useStoreInstance = React.useRef<ContextValue>(createBlueprintStore(options)).current;
  const storeModel = useStoreInstance((state) => state.storeModel);
  useEffect(() => {
    storeModel(model ? model : null);
  }, [model]);

  return <store.Provider value={useStoreInstance}>{children}</store.Provider>;
};

export const useBlueprint = <T,>(selector?: (state: BlueprintStore) => T, equalityFn?: (a: T, b: T) => boolean): T => {
  const context = React.useContext(store);
  if (context === null) {
    throw new Error('useBlueprint must be used within a StateProvider');
  }
  if (!selector && !equalityFn) {
    return context() as T;
  } else if (selector && !equalityFn) {
    return context(selector);
  } else if (selector && equalityFn) {
    return useStoreWithEqualityFn(context, selector, equalityFn);
  } else return context() as T;
};
