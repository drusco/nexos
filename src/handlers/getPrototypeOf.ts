import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import resolveProxy from "../utils/resolveProxy.js";

export default function getPrototypeOf(nexoId: symbol) {
  return (target: nx.Traceable): object => {
    const [proxy, wrapper] = resolveProxy(target, nexoId);
    const { sandbox } = wrapper;
    const prototype = Reflect.getPrototypeOf(target);
    const proto = sandbox ? Reflect.getPrototypeOf(sandbox) : prototype;

    new ProxyEvent("getPrototypeOf", {
      target: proxy,
      cancelable: false,
      nexoId: nexoId,
      data: { target, result: proto },
    });

    return prototype;
  };
}
