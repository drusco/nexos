import Exotic from "../types/Exotic.js";
import map from "./map.js";

const isTarget = (value: any): value is Exotic.traceable => {
  return map.targets.has(value);
};

export default isTarget;
