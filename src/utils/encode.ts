import Nexo from "../types/Nexo.js";
import {
  findProxy,
  isTraceable,
  getProxyPayload,
  isPlainObject,
} from "./index.js";

type plainObjectOrArray = Nexo.plainObject | Array<unknown>;

export default function encode(
  value: unknown,
  callback: (value: unknown) => unknown = (value) => value,
  cache: WeakMap<plainObjectOrArray, plainObjectOrArray> = new WeakMap(),
): unknown {
  const proxy = findProxy(value);

  // return the string that represents the proxy

  if (proxy) {
    return getProxyPayload(proxy);
  }

  // return original value for untraceable values

  if (!isTraceable(value)) {
    return value;
  }

  // return original value

  const isObject = isPlainObject(value);
  const isArray = Array.isArray(value);

  if (!isObject && !isArray) {
    return callback(value);
  }

  // Handle circular reference by returning a shallow copy

  if (cache.has(value)) {
    return cache.get(value);
  }

  // return shallow copy for plain objects and arrays

  const copy = isArray ? [] : {};
  const keys = Object.keys(value);

  cache.set(value, copy);

  keys.forEach((key) => {
    copy[key] = encode(value[key], callback, cache);
  });

  return copy;
}
