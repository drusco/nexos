import isPlainObject from "is-plain-obj";
import isTraceable from "./isTraceable.js";

const cache: WeakMap<object, object> = new WeakMap();

type ReturnType<E, T> = E extends void ? T : E;

const cloneModify = <Expected = void, T = unknown>(
  value: T,
  deep: boolean = true,
  modify: (value: unknown) => unknown = (value) => value,
): ReturnType<Expected, T> => {
  // return the original or transformed value for untraceable values

  if (!isTraceable(value)) {
    return modify(value) as ReturnType<Expected, T>;
  }

  // return the original or transformed value for special objects

  const isObject = isPlainObject(value);
  const isArray = Array.isArray(value);

  if (!isObject && !isArray) {
    return modify(value) as ReturnType<Expected, T>;
  }

  // Handle circular reference by returning a shallow copy in cache

  if (cache.has(value)) {
    return cache.get(value) as ReturnType<Expected, T>;
  }

  // return a shallow copy for plain objects and arrays

  const copy: object = isArray ? [] : {};
  const keys = Object.keys(value);

  cache.set(value, copy);

  keys.forEach((key) => {
    if (deep) {
      copy[key] = cloneModify(value[key], true, modify);
      return;
    }
    copy[key] = modify(value[key]);
  });

  return copy as ReturnType<Expected, T>;
};

export default cloneModify;
