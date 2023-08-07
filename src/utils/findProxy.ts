import Exotic from "../types/Exotic";
import map from "./map";

const findProxy = (value: any): Exotic.Proxy | undefined => {
  if (map.proxies.has(value)) return value; // value is already a proxy
  if (map.targets.has(value)) return map.targets.get(value); // return proxy linked to value
  if (map.mocks.has(value)) return map.mocks.get(value); // return proxy linked tu mock (internal)
  return;
};

export default findProxy;
