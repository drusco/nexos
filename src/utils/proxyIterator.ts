import Nexo from "../types/Nexo.js";

const proxyIterator = function* (scope: Nexo): IterableIterator<Nexo.Proxy> {
  for (const [, ref] of scope.map) {
    const proxy = ref.deref();
    if (proxy) yield proxy;
  }
};

export default proxyIterator;
