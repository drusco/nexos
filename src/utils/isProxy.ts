import Nexo from "../lib/types/Nexo.js";
import map from "../lib/maps.js";

const isProxy = (value: unknown): value is Nexo.Proxy => {
  return map.proxies.has(value as Nexo.Proxy);
};

export default isProxy;
