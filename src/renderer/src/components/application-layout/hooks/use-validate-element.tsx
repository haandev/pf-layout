import clsx from 'clsx';
import { useEffect } from 'react';

export const getParent = (ref: React.RefObject<Element> | null) => {
  let parent: null | Element = null;
  if (!ref) return null;
  if (ref.current) {
    parent = ref.current.parentElement;
  }

  return parent;
};

type Quantity = {
  maxItems?: number;
  minItems?: number;
  items?: number;
};
type ElementValidationRule = {
  className?: string | string[];
  id?: string;
  name?: string;
  dataAttributes?: { [key: string]: string };
  $match?: string;
  $closest?: string;
  $querySelector?: string;
  $querySelectorAll?: {
    query: string;
  } & Quantity;

  $children?: ElementValidationRule & Quantity;
  $descendants?: ElementValidationRule & Quantity;

  $parent?: ElementValidationRule;
  $ancestors?: ElementValidationRule & Quantity;

  [key: string]: any;
};

/**
 * Validate an element based on the rules provided
 * @param element Element to validate
 * @param rules Validation rules
 * @param maxRecursion Maximum recursion depth
 * @returns boolean | null
 * Boolean if element is valid or invalid, null if no validation is performed (element is null or undefined)
 */
export const validateElement = (element: Element | null | undefined, rules: ElementValidationRule, maxRecursion = 50): boolean | number | null => {
  if (maxRecursion <= 0) return null;
  maxRecursion--;
  if (!element) return -1;
  const { className, id, name, dataAttributes, $match, $closest, $querySelector, $querySelectorAll, $children, $parent, $ancestors, $descendants, ...rest } =
    rules;
  let result: boolean | number | null = true;

  // match validation
  if ($match && !element.matches($match)) {
    return false;
  }

  //className validation
  if (className) {
    const classNames = clsx(className).split(' ').filter(Boolean);
    if (parent) {
      result = result && classNames.every((c) => element.classList.contains(c));
      if (!result) return false;
    }
  }

  // ID validation
  if (id && element.id !== id) {
    return false;
  }

  // Name attribute validation
  if (name && element.getAttribute('name') !== name) {
    return false;
  }

  // Data attribute validation using dataset
  if (dataAttributes) {
    const _element = element as HTMLElement;
    if (!_element.dataset) return false;
    for (const key in rules.dataAttributes)
      if (_element.dataset[key] !== rules.dataAttributes[key]) {
        return false;
      }
  }

  // Closest validation
  if ($closest && !element.closest($closest)) {
    return false;
  }

  // querySelector validation
  if ($querySelector && !element.querySelector($querySelector)) {
    return false;
  }

  // querySelectorAll validation
  if ($querySelectorAll) {
    const { query, maxItems, minItems, items } = $querySelectorAll;
    const elements = element.querySelectorAll(query);
    if (maxItems && elements.length > maxItems) {
      return false;
    }
    if (minItems && elements.length < minItems) {
      return false;
    }
    if (items && elements.length !== items) {
      return false;
    }
  }
  // children
  if ($children) {
    const children = Array.from(element.children);
    const _result = validateElements(children, $children, maxRecursion);
    if (_result === false) return false;
    if ($children.maxItems && (_result || 0) > $children.maxItems) {
      return false;
    }
    if ($children.minItems && (_result || 0) < $children.minItems) {
      return false;
    }
    if ($children.items && (_result || 0) !== $children.items) {
      return false;
    }
  }
  // parent validation
  if ($parent) {
    let result: boolean | null | number = false;
    result = validateElement(element.parentElement, $parent, maxRecursion);
    if (!result === true) return result;
  }

  // ancestors validation
  if ($ancestors) {
    const { maxItems, minItems, items, ...ancestorRule } = $ancestors;
    let matchingAncestorCount = 0;
    let parent = element.parentElement;
    while (parent && matchingAncestorCount <= (minItems || 1)) {
      result = validateElement(parent, ancestorRule, maxRecursion);
      if (result) matchingAncestorCount++;
      parent = parent.parentElement;
      if (maxItems && matchingAncestorCount > maxItems) {
        return false;
      }
      if (matchingAncestorCount >= (minItems || 1)) {
        break;
      }
    }
    if (matchingAncestorCount < (minItems || 1)) {
      return false;
    }
    if (items && matchingAncestorCount !== items) {
      return false;
    }
  }

  //descendants validation
  if ($descendants) {
    const { maxItems, minItems, items, ...descendantRule } = $descendants;
    let matchingDescendantCount = 0;
    const descendants = element.querySelectorAll('*');
    for (const descendant of descendants) {
      result = validateElement(descendant, descendantRule, maxRecursion);
      if (result) matchingDescendantCount++;
      if (maxItems && matchingDescendantCount > maxItems) {
        return false;
      }
    }
    if (matchingDescendantCount < (minItems || 1)) {
      return false;
    }
    if (items && matchingDescendantCount !== items) {
      return false;
    }
  }

  //others
  for (const key in rest) {
    if (element.getAttribute(key) !== rest[key]) {
      return false;
    }
  }
  return result;
};

/**
 * Validate an array of elements based on the rules provided
 * @param elements Array of elements to validate
 * @param rules Validation rules
 * @param maxRecursion Maximum recursion depth
 * @returns number | null | false
 * Number of valid elements in the array,
 * False if the maximum number of elements is exceeded, minimum number of elements is not met, or the number of elements does not match the required number of elements
 * Null if no validation is performed (elements is null or undefined)
 */
export const validateElements = (elements: Element[] | Element | null | undefined, rules: ElementValidationRule & Quantity, maxRecursion = 50) => {
  if (maxRecursion <= 0) return -1;
  maxRecursion--;

  let result = 0;
  let nothingTested = true;
  elements = Array.isArray(elements) ? elements : ([elements] as Element[]);

  if (rules.maxItems && elements.length > rules.maxItems) return false;
  if (rules.minItems && elements.length < rules.minItems) return false;
  if (rules.items && elements.length !== rules.items) return false;

  for (const element of elements) {
    if (element) nothingTested = false;
    const _result = validateElement(element, rules, maxRecursion);
    if (_result === true) {
      result++;
    }
  }
  if (nothingTested) return -1;
  return result;
};

export const useValidateElement = (
  ref: React.RefObject<Element>,
  rules: ElementValidationRule,
  callback: (validation: -1 | boolean | null | number) => void,
  maxRecursion = 50
) => {
  useEffect(() => {
    if (ref.current) {
      const validation = validateElement(ref.current, rules, maxRecursion);
      callback(validation);
    }
  }, [ref.current]);
};

export const useValidateElements = (
  refs: React.RefObject<Element>[],
  rules: ElementValidationRule & Quantity,
  callback: (validation: number | -1 | false) => void,
  maxRecursion = 50
) => {
  const elements = refs.map((r) => r.current).filter(Boolean) as Element[];

  useEffect(() => {
    elements.length === 0 && callback(-1);
    const validation = validateElements(elements, rules, maxRecursion);
    callback(validation);
  }, [...elements]);
};
