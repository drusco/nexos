import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import resolveProxy from "../utils/resolveProxy.js";

export default function preventExtensions(nexoId: symbol) {
  return (target: nx.Traceable): boolean => {
    const [proxy] = resolveProxy(target, nexoId);
    const result = Reflect.preventExtensions(target);

    new ProxyEvent("preventExtensions", {
      target: proxy,
      cancelable: false,
      nexoId: nexoId,
      data: { target, result },
    });

    return result;
  };
}
