import Exotic from "../types/Exotic.js";
import findProxy from "./findProxy.js";
import map from "./map.js";
import isTraceable from "./isTraceable.js";

export default function encode(
  value: any,
  visited: WeakSet<Exotic.traceable> = new WeakSet(),
): any {
  const proxy = findProxy(value);

  if (proxy) {
    return `⁠${map.proxies.get(proxy).id}`;
  }

  if (isTraceable(value)) {
    if (typeof value === "function") {
      return value;
    }

    if (visited.has(value)) {
      // Handle circular reference by returning the original value
      return value;
    }

    visited.add(value);

    const isArray = Array.isArray(value);
    const copy = isArray ? [] : {};

    if (isArray) {
      for (let i = 0; i < value.length; i++) {
        (copy as any[]).push(encode(value[i], visited));
      }
    } else {
      for (const key of Object.keys(value)) {
        copy[key] = encode(value[key], visited);
      }
    }

    return copy;
  }

  return value;
}
