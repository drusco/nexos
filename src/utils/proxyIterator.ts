import Exotic from "../types/Exotic.js";
import map from "./map.js";

const proxyIterator = function* (): IterableIterator<Exotic.Proxy> {
  for (const proxy of map.proxySet) {
    yield proxy;
  }
};

export default proxyIterator;
