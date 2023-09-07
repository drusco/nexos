import Exotic from "../types/Exotic.js";
import findProxy from "./findProxy.js";
import findProxyById from "./findProxyById.js";
import isPayload from "./isPayload.js";
import isTraceable from "./isTraceable.js";
import map from "./map.js";

export default function decode(
  scope: Exotic.Emulator,
  value: any,
  visited: WeakSet<Exotic.traceable> = new WeakSet(),
): any {
  if (isPayload(value)) {
    const { links } = map.emulators.get(scope);
    return links[value] || findProxyById(scope, value);
  }

  const proxy = findProxy(value);

  if (proxy) {
    return proxy;
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

  const copy = Array.isArray(value) ? [] : {};
  const keys = Object.keys(value);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    copy[key] = decode(scope, value[key], visited);
  }

  return copy;
}
