import Exotic from "../types/Exotic";
import findProxy from "./findProxy";
import map from "./map";

const proxyGenerator = function* (
  scope: Exotic.Emulator,
  value?: Exotic.traceable,
  reverse: boolean = false,
): Iterable<Exotic.Proxy> {
  if (value === undefined) {
    for (const ref of scope.refs) {
      for (const proxy of proxyGenerator(scope, scope.useRef(ref))) {
        if (!scope.revoked(proxy)) {
          yield proxy;
        }
      }
    }
    return;
  }

  const proxy = findProxy(value);
  if (!proxy) return;

  if (!scope.revoked(proxy)) {
    yield proxy;
  }

  const { next, prev } = map.proxies.get(proxy);
  const item = reverse ? prev : next;

  if (item) {
    for (const proxy of proxyGenerator(scope, item, reverse)) {
      if (!scope.revoked(proxy)) {
        yield proxy;
      }
    }
  }
};

export default proxyGenerator;
