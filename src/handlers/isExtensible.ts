import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";

export default function isExtensible(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable): boolean => {
    const [proxy] = resolveProxy();
    const extensible = Reflect.isExtensible(target);

    new ProxyEvent("isExtensible", {
      target: proxy,
      cancelable: false,
      data: { target, result: extensible },
    });

    return extensible;
  };
}
