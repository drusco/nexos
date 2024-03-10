import Nexo from "../types/Nexo.js";
import findProxyById from "./findProxyById.js";
import isProxyPayload from "./isProxyPayload.js";
import isTraceable from "./isTraceable.js";

export default function decode<Type>(
  scope: Nexo.instance,
  value: Type,
  visited: WeakSet<Nexo.traceable> = new WeakSet(),
): Type | Nexo.Proxy {
  if (isProxyPayload(value)) {
    const proxyById = findProxyById(scope, value);
    return proxyById || value;
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

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    copy[key] = decode(scope, value[key], visited);
  }

  return copy;
}
