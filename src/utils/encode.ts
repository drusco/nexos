import Nexo from "../types/Nexo.js";
import {
  findProxy,
  isTraceable,
  getProxyPayload,
  isPlainObject,
} from "./index.js";

// Encodes a proxy to its string (payload) representation

export default function encode<Type>(
  value: Type,
  visited: WeakSet<Nexo.traceable> = new WeakSet(),
): Type | string {
  const proxy = findProxy(value);

  // return the string that represents the proxy

  if (proxy) {
    return getProxyPayload(proxy);
  }

  // return original value for untraceable values

  if (!isTraceable(value)) {
    return value;
  }

  // Handle circular reference by returning the original value

  if (visited.has(value)) {
    return value;
  }

  visited.add(value);

  // return original value

  const isObject = isPlainObject(value);
  const isArray = Array.isArray(value);

  if (!(isObject || isArray)) {
    return value;
  }

  // return shallow copy for plain-objects and arrays

  const copy = (isArray ? [] : {}) as Type;
  const keys = Object.keys(value);

  keys.forEach((key) => {
    copy[key] = encode(value[key], visited);
  });

  return copy;
}
