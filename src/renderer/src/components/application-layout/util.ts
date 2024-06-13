export const findById = <T extends { id: number | string }>(arr: T[], id?: number | string): T | undefined => {
  if (!id) return undefined;
  return arr.find((item) => item?.id === id);
};

export const findIndexById = <T extends { id: number | string }>(arr: T[], id?: number | string): number => {
  if (!id) return -1;
  return arr.findIndex((item) => item?.id === id);
};

export const toRemovedById = <T extends { id: number | string }>(arr: T[], id?: number | string): T[] => {
  if (!id) return arr;
  return arr.filter((item) => item?.id !== id);
};

export const removeById = <T extends { id: number | string }>(arr: T[], id?: number | string): void => {
  if (!id) return;
  arr.splice(findIndexById(arr, id), 1);
};

export const spliceById = <T extends { id: number | string }>(arr: T[], id: number | string, deleteCount: number, ...item: T[]): void => {
  if (!id) return;
  const index = findIndexById(arr, id);
  if (index === -1) return;
  arr.splice(index, deleteCount, ...item);
};

export const isEmpty = (value: unknown) => {
  return value === null || value === undefined || (Array.isArray(value) && value.length === 0) || Object.keys(value).length === 0;
};

export const evalBoolean = <T extends (...params: any[]) => boolean>(
  funcOrBool: T | boolean | undefined | null,
  ...params: T extends boolean ? never : Parameters<T>
): boolean => {
  if (funcOrBool === undefined || funcOrBool === null) {
    return false;
  } else if (typeof funcOrBool === 'boolean') {
    return funcOrBool;
  } else if (typeof funcOrBool === 'function') {
    return funcOrBool(...params);
  } else {
    return true;
  }
};
