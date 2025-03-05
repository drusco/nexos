import type * as nx from "../types/Nexo.js";
import map from "./maps.js";

const isProxy = (value: unknown): value is nx.Proxy => {
  return map.proxies.has(value as nx.Proxy);
};

export default isProxy;
