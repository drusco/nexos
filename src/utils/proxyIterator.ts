import Nexo from "../lib/types/Nexo.js";
import ProxyNexo from "../lib/ProxyNexo.js";

const proxyIterator = function* (
  scope: ProxyNexo,
): IterableIterator<Nexo.Proxy> {
  for (const [, ref] of scope.entries) {
    const proxy = ref.deref();
    if (proxy) {
      yield proxy;
    }
  }
};

export default proxyIterator;
