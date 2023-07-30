import Exotic from "../types/Exotic";
import map from "./map";

const findProxy = (value: any): Exotic.Proxy | null => {
  if (map.proxies.has(value)) return value; // value is already a proxy
  if (map.targets.has(value)) return map.targets.get(value); // return proxy linked to value
  if (map.dummies.has(value)) return map.dummies.get(value); // return proxy linked tu dummy (internal)
  return null;
};

export default findProxy;
