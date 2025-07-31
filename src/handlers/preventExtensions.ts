import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";

export default function preventExtensions(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable): boolean => {
    const [proxy, wrapper] = resolveProxy();
    const { sandbox } = wrapper;
    const result = Reflect.preventExtensions(target);

    if (sandbox) {
      Reflect.preventExtensions(sandbox);
    }

    new ProxyEvent("preventExtensions", {
      target: proxy,
      cancelable: false,
      data: {
        target: sandbox || target,
        result,
      },
    });

    return result;
  };
}
