import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";

export default function getOwnPropertyDescriptor(
  resolveProxy: nx.resolveProxy,
) {
  return (target: nx.Traceable, property: nx.ObjectKey): PropertyDescriptor => {
    const [proxy, wrapper] = resolveProxy();
    const { sandbox } = wrapper;

    const targetDescriptor = Reflect.getOwnPropertyDescriptor(target, property);

    const descriptor = sandbox
      ? Object.getOwnPropertyDescriptor(sandbox, property)
      : targetDescriptor;

    new ProxyEvent("getOwnPropertyDescriptor", {
      target: proxy,
      cancelable: false,
      data: {
        target: sandbox || target,
        property,
        descriptor,
      },
    });

    return targetDescriptor;
  };
}
