import Exotic from "../types/Exotic.js";
import map from "./map.js";

const isProxy = (value: any): value is Exotic.Proxy => {
  return map.proxies.has(value);
};

export default isProxy;
