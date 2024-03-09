import Nexo from "../types/Nexo.js";
import findProxy from "./findProxy.js";
import isTraceable from "./isTraceable.js";
import getProxyPayload from "./getProxyPayload.js";

// Intenta codificar un proxy a su representacion en string
// devuelve un objeto que incluye string representando proxys codificados

export default function encode<Type>(
  value: Type,
  visited: WeakSet<Nexo.traceable> = new WeakSet(),
): unknown {
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

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    copy[key] = encode(value[key], visited);
  }

  return copy;
}
