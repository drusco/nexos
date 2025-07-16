import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";

export default function getPrototypeOf(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable): object => {
    const [proxy, wrapper] = resolveProxy();
    const { sandbox } = wrapper;
    const prototype = Reflect.getPrototypeOf(target);
    const proto = sandbox ? Reflect.getPrototypeOf(sandbox) : prototype;

    new ProxyEvent("getPrototypeOf", {
      target: proxy,
      cancelable: false,
      data: { target, result: proto },
    });

    return prototype;
  };
}
