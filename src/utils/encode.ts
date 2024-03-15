import Nexo from "../types/Nexo.js";
import { findProxy, isTraceable, getProxyPayload } from "./index.js";

// Encodes a proxy to its string (payload) representation

export default function encode<Type>(
  value: Type,
  visited: WeakSet<Nexo.traceable> = new WeakSet(),
): Type | string {
  const proxy = findProxy(value);

  if (proxy) {
    return getProxyPayload(proxy);
  }

  if (!isTraceable(value)) {
    return value;
  }

  if (typeof value === "function") {
    return value;
  }

  if (visited.has(value)) {
    // Handle circular reference by returning the original value
    return value;
  }

  visited.add(value);

  const copy = (Array.isArray(value) ? [] : {}) as Type;
  const keys = Object.keys(value);

  keys.forEach((key) => {
    copy[key] = encode(value[key], visited);
  });

  return copy;
}
