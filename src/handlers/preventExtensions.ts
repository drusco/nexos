import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";

export default function preventExtensions(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable): boolean => {
    const [proxy] = resolveProxy();
    const result = Reflect.preventExtensions(target);

    new ProxyEvent("preventExtensions", {
      target: proxy,
      cancelable: false,
      data: { target, result },
    });

    return result;
  };
}
