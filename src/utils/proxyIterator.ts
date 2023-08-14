import Exotic from "../types/Exotic";
import map from "./map";

const proxyIterator = function* (): IterableIterator<Exotic.Proxy> {
  for (const proxy of map.proxySet) {
    yield proxy;
  }
};

export default proxyIterator;
