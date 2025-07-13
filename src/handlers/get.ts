import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import resolveProxy from "../utils/resolveProxy.js";

export default function get(nexoId: symbol) {
  return (target: nx.Traceable, property: nx.ObjectKey): unknown => {
    const [proxy, wrapper] = resolveProxy(target, nexoId);
    const { sandbox, nexo } = wrapper;

    const result = sandbox
      ? Reflect.has(sandbox, property)
        ? Reflect.get(sandbox, property)
        : nexo.create()
      : Reflect.get(target, property);

    new ProxyEvent("get", {
      target: proxy,
      cancelable: false,
      data: { target, property, result },
    });

    return result;
  };
}
