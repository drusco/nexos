import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";

export default function set(resolveProxy: nx.resolveProxy) {
  return (
    target: nx.Traceable,
    property: nx.ObjectKey,
    value: unknown,
  ): boolean => {
    const [proxy, wrapper] = resolveProxy();
    const { sandbox } = wrapper;

    const event = new ProxyEvent("set", {
      target: proxy,
      data: {
        target: sandbox || target,
        property,
        value,
      },
    });

    if (event.defaultPrevented) {
      if (!Reflect.set(sandbox || target, property, event.returnValue)) {
        throw new ProxyError(
          `Cannot set property '${String(property)}' on the ${sandbox ? "sandbox" : "target"}`,
          proxy,
        );
      }
      return true;
    }

    if (!Reflect.set(sandbox || target, property, value)) {
      throw new ProxyError(
        `Cannot set property '${String(property)}' on the ${sandbox ? "sandbox" : "target"}`,
        proxy,
      );
    }

    return true;
  };
}
