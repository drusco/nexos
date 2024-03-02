import Exotic from "../types/Exotic.js";
import map from "./map.js";

const proxyIterator = function* (
  scope: Exotic.Emulator,
): IterableIterator<Exotic.Proxy> {
  const { proxyMap } = map.emulators.get(scope);
  for (const [, ref] of proxyMap) {
    yield ref.deref();
  }
};

export default proxyIterator;
