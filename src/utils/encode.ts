import Exotic from "../types/Exotic";
import findProxy from "./findProxy";
import map from "./map";
import isTraceable from "./isTraceable";

export default function encode(
  value: any,
  visited: WeakSet<Exotic.traceable> = new WeakSet(),
): any {
  const traceable = isTraceable(value);
  const proxy = findProxy(value);

  if (proxy) {
    return `⁠${map.proxies.get(proxy).id}`;
  }

  if (traceable) {
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
    const keys = Object.keys(value);

    if (isArray) {
      for (let i = 0; i < value.length; i++) {
        (copy as any[]).push(encode(value[i], visited));
      }
    } else {
      for (const key of keys) {
        copy[key] = encode(value[key], visited);
      }
    }

    return copy;
  }

  return value;
}
