import Exotic from "../types/Exotic";
import findProxy from "./findProxy";
import map from "./map";

const proxyGenerator = function* (
  scope: Exotic.Emulator,
  value?: Exotic.traceable,
  reverse: boolean = false,
): IterableIterator<Exotic.Proxy> {
  if (value === undefined) {
    const { firstProxy, lastProxy } = map.emulators.get(scope);
    const item = reverse ? lastProxy : firstProxy;

    if (!item) return;

    for (const proxy of proxyGenerator(scope, item, reverse)) {
      if (!scope.isRevoked(proxy)) {
        yield proxy;
      }
    }
    return;
  }

  const proxy = findProxy(value);

  if (!proxy) {
    return;
  }

  if (!scope.isRevoked(proxy)) {
    yield proxy;
  }

  const { next, prev } = map.proxies.get(proxy);
  const item = reverse ? prev : next;

  if (item) {
    for (const proxy of proxyGenerator(scope, item, reverse)) {
      if (!scope.isRevoked(proxy)) {
        yield proxy;
      }
    }
  }
};

export default proxyGenerator;
