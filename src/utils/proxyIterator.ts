import Exotic from "../types/Exotic.js";
import map from "./map.js";

const proxyIterator = function* (
  scope: Exotic.Emulator,
): IterableIterator<Exotic.Proxy> {
  const { proxySet } = map.emulators.get(scope);
  for (const proxy of proxySet) {
    yield proxy;
  }
};

export default proxyIterator;
