import Exotic from "../types/Exotic.js";
import findProxyById from "./findProxyById.js";
import findProxyByLink from "./findProxyByLink.js";
import isProxyPayload from "./isProxyPayload.js";
import isTraceable from "./isTraceable.js";

export default function decode<Type>(
  scope: Exotic.Emulator,
  value: Type,
  visited: WeakSet<Exotic.traceable> = new WeakSet(),
): Type | Exotic.Proxy {
  if (isProxyPayload(value)) {
    const proxyById = findProxyById(scope, value);
    const proxyByLink = findProxyByLink(scope, value);
    return proxyByLink || proxyById || value;
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
