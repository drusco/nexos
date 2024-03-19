import Nexo from "../types/Nexo.js";
import isPlainObject from "is-plain-obj";
import { findProxy, isTraceable, getProxyPayload } from "./index.js";

type plainObjectOrArray = Nexo.plainObject | Array<unknown>;

export default function encode(
  value: unknown,
  transform: (value: unknown, isProxyPayload?: boolean) => unknown = (
    value,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isProxyPayload = false,
  ) => value,
  cache: WeakMap<plainObjectOrArray, plainObjectOrArray> = new WeakMap(),
): unknown {
  const proxy = findProxy(value);

  // return a proxy payload or a transformed value

  if (proxy) {
    return transform(getProxyPayload(proxy), true);
  }

  // return the original or transformed value for untraceable values

  if (!isTraceable(value)) {
    return transform(value);
  }

  // return the original or transformed value for special objects

  const isObject = isPlainObject<Nexo.plainObject>(value);
  const isArray = Array.isArray(value);

  if (!isObject && !isArray) {
    return transform(value);
  }

  // Handle circular reference by returning a shallow copy in cache

  if (cache.has(value)) {
    return cache.get(value);
  }

  // return a shallow copy for plain objects and arrays

  const copy: plainObjectOrArray = isArray ? [] : {};
  const keys = Object.keys(value);

  cache.set(value, copy);

  keys.forEach((key) => {
    copy[key] = encode(value[key], transform, cache);
  });

  return copy;
}
