import Exotic from "../types/Exotic.js";
import findProxy from "./findProxy.js";
import findProxyById from "./findProxyById.js";
import isPayload from "./isPayload.js";
import isTraceable from "./isTraceable.js";
import map from "./map.js";
import constants from "./constants.js";

export default function decode(
  scope: Exotic.Emulator,
  value: any,
  visited: WeakSet<Exotic.traceable> = new WeakSet(),
): any {
  const proxy = findProxy(value);

  if (proxy) {
    return proxy;
  }

  if (isPayload(value)) {
    const { links } = map.emulators.get(scope);
    return links[value] || findProxyById(scope, value);
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
        (copy as any[]).push(decode(scope, value[i], visited));
      }
    } else {
      for (const key of Object.keys(value)) {
        copy[key] = decode(scope, value[key], visited);
      }
    }

    return copy;
  }

  if (typeof value === "string" && constants.HAS_PROXY_ID_REGEXP.test(value)) {
    return value.replace(
      constants.HAS_PROXY_ID_REGEXP,
      "($.target($.decode('$1')))",
    );
  }

  return value;
}
