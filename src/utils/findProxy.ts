import Exotic from "../types/Emulator";
import map from "./map.js";

const find = (value: any): Exotic.Proxy | null => {
  if (map.proxies.has(value)) return value; // value is already a proxy
  if (map.targets.has(value)) return map.targets.get(value); // return proxy linked to value
  return null;
};

export default find;
