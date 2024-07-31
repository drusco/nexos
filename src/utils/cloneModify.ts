import nx from "../types/Nexo.js";
import isPlainObject from "is-plain-obj";
import isTraceable from "./isTraceable.js";

type clone<Expected, Type> = nx.typeExtends<Expected, void, Type>;

const cache: WeakMap<object, object> = new WeakMap();

const cloneModify = <Expected = void, Type = unknown>(
  value: Type,
  deep: boolean = true,
  modify: nx.functionLike = (value: unknown) => value,
): clone<Expected, Type> => {
  // return the transformed value for untraceable values

  if (!isTraceable(value)) {
    return modify(value);
  }

  // return the transformed value for functions

  const isObject = isPlainObject(value);
  const isArray = Array.isArray(value);

  if (!isObject && !isArray) {
    return modify(value);
  }

  // Handle circular references using cached values

  if (cache.has(value)) {
    return cache.get(value) as clone<Expected, Type>;
  }

  // return a shallow copy for objects and arrays

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

  return copy as clone<Expected, Type>;
};

export default cloneModify;
