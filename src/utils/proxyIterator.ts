import Nexo from "../lib/types/Nexo.js";
import NexoProxy from "../lib/NexoProxy.js";

const proxyIterator = function* (
  scope: NexoProxy,
): IterableIterator<Nexo.Proxy> {
  for (const [id, ref] of scope.entries) {
    const proxy = ref.deref();
    if (proxy) yield proxy;
    else {
      scope.entries.delete(id);
      scope.emit("nx.delete", id);
    }
  }
};

export default proxyIterator;
