import Exotic from "../types/Exotic.js";
import findProxy from "./findProxy.js";
import map from "./map.js";
import isTraceable from "./isTraceable.js";
import constants from "./constants.js";

export default function encode(
  value: any,
  visited: WeakSet<Exotic.traceable> = new WeakSet(),
): any {
  const proxy = findProxy(value);

  if (proxy) {
    return `${constants.NO_BREAK + map.proxies.get(proxy).id}`;
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
    copy[key] = encode(value[key], visited);
  }

  return copy;
}
