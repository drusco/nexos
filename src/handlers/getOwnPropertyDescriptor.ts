import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import resolveProxy from "../utils/resolveProxy.js";

export default function getOwnPropertyDescriptor(nexoId: symbol) {
  return (target: nx.Traceable, property: nx.ObjectKey): PropertyDescriptor => {
    const [proxy, wrapper] = resolveProxy(target, nexoId);
    const { sandbox } = wrapper;

    const targetDescriptor = Reflect.getOwnPropertyDescriptor(target, property);

    const descriptor = sandbox
      ? Object.getOwnPropertyDescriptor(sandbox, property)
      : targetDescriptor;

    new ProxyEvent("getOwnPropertyDescriptor", {
      target: proxy,
      cancelable: false,
      nexoId: nexoId,
      data: {
        target,
        property,
        descriptor,
      },
    });

    return targetDescriptor;
  };
}
