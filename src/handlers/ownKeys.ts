import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import resolveProxy from "../utils/resolveProxy.js";

export default function ownKeys(nexoId: symbol) {
  return (target: nx.Traceable): nx.ObjectKey[] => {
    const [proxy, wrapper] = resolveProxy(target, nexoId);
    const { sandbox } = wrapper;

    const targetKeys = Reflect.ownKeys(target);
    const keys = sandbox ? Reflect.ownKeys(sandbox) : targetKeys;

    new ProxyEvent("ownKeys", {
      target: proxy,
      cancelable: false,
      nexoId: nexoId,
      data: { target, result: keys },
    });

    // Return the own keys from the current proxy target
    return targetKeys;
  };
}
