import type * as nx from "../types/Nexo.js";

const proxyMap = new WeakMap();

export default function getProxyMap<T extends object>(): WeakMap<nx.Proxy, T> {
  return proxyMap;
}
