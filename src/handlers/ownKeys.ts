import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";

export default function ownKeys(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable): nx.ObjectKey[] => {
    const [proxy, wrapper] = resolveProxy();
    const { sandbox } = wrapper;

    const targetKeys = Reflect.ownKeys(target);
    const keys = sandbox ? Reflect.ownKeys(sandbox) : targetKeys;

    new ProxyEvent("ownKeys", {
      target: proxy,
      cancelable: false,
      data: { target, result: keys },
    });

    // Return the own keys from the current proxy target
    return targetKeys;
  };
}
