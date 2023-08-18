import Exotic from "../types/Exotic";
import findProxy from "./findProxy";
import findProxyById from "./findProxyById";
import isPayload from "./isPayload";
import isTraceable from "./isTraceable";

export default function decode(
  scope: Exotic.Emulator,
  value: any,
  visited: WeakSet<Exotic.traceable> = new WeakSet(),
): any {
  const traceable = isTraceable(value);
  const proxy = findProxy(value);
  const payload = isPayload(value);

  if (proxy) {
    return proxy;
  }

  if (payload) {
    return findProxyById(scope, value[1]);
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
        (copy as any[]).push(decode(scope, value[i], visited));
      }
    } else {
      for (const key of keys) {
        copy[key] = decode(scope, value[key], visited);
      }
    }

    return copy;
  }

  return value;
}
