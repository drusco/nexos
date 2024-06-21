import type nx from "../lib/types/Nexo.js";
import map from "../lib/maps.js";

const isProxy = (value: unknown): value is nx.Proxy => {
  return map.proxies.has(value as nx.Proxy);
};

export default isProxy;
