import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";

export default function has(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable, property: nx.ObjectKey): boolean => {
    const [proxy, wrapper] = resolveProxy();
    const { sandbox } = wrapper;
    const targetHasProperty = Reflect.has(target, property);
    const sandboxHasProperty = sandbox ? Reflect.has(sandbox, property) : false;
    const result = sandbox ? sandboxHasProperty : targetHasProperty;

    new ProxyEvent("has", {
      target: proxy,
      cancelable: false,
      data: {
        target: sandbox || target,
        property,
        result,
      },
    });

    if (sandbox) {
      return sandboxHasProperty;
    }

    return targetHasProperty;
  };
}
