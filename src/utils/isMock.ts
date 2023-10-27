import Exotic from "../types/Exotic.js";
import map from "./map.js";

const isMock = (value: any): value is Exotic.Mock => {
  return map.mocks.has(value);
};

export default isMock;
