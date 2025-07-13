import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import resolveProxy from "../utils/resolveProxy.js";

export default function isExtensible(nexoId: symbol) {
  return (target: nx.Traceable): boolean => {
    const [proxy] = resolveProxy(target, nexoId);
    const extensible = Reflect.isExtensible(target);

    new ProxyEvent("isExtensible", {
      target: proxy,
      cancelable: false,
      data: { target, result: extensible },
    });

    return extensible;
  };
}
