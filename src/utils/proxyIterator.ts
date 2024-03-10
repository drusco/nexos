import Nexo from "../types/Nexo.js";
import map from "./map.js";

const proxyIterator = function* (
  scope: Nexo.instance,
): IterableIterator<Nexo.Proxy> {
  const { proxyMap } = map.emulators.get(scope);
  for (const [, ref] of proxyMap) {
    const proxy = ref.deref();
    if (proxy) yield proxy;
  }
};

export default proxyIterator;
