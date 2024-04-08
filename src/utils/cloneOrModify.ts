import Nexo from "../lib/types/Nexo.js";
import isPlainObject from "is-plain-obj";
import { isTraceable } from "./index.js";

type objectOrArray = Nexo.plainObject | Nexo.arrayLike;

export default function cloneOrModify(
  value: unknown,
  modify: (value: unknown) => unknown = (value) => value,
  cache: WeakMap<objectOrArray, objectOrArray> = new WeakMap(),
): unknown {
  // return the original or transformed value for untraceable values

  if (!isTraceable(value)) {
    return modify(value);
  }

  // return the original or transformed value for special objects

  const isObject = isPlainObject(value);
  const isArray = Array.isArray(value);

  if (!isObject && !isArray) {
    return modify(value);
  }

  // Handle circular reference by returning a shallow copy in cache

  if (cache.has(value)) {
    return cache.get(value);
  }

  // return a shallow copy for plain objects and arrays

  const copy: objectOrArray = isArray ? [] : {};
  const keys = Object.keys(value);

  cache.set(value, copy);

  keys.forEach((key) => {
    copy[key] = cloneOrModify(value[key], modify, cache);
  });

  return copy;
}
