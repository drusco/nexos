import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";
import resolveProxy from "../utils/resolveProxy.js";

export default function setPrototypeOf(nexoId: symbol) {
  return (target: nx.Traceable, prototype: object): boolean => {
    const [proxy, wrapper] = resolveProxy(target, nexoId);
    const { sandbox } = wrapper;
    const extensible = Reflect.isExtensible(target);
    const currentPrototype = Reflect.getPrototypeOf(target);

    const event = new ProxyEvent("setPrototypeOf", {
      target: proxy,
      cancelable: true,
      nexoId: nexoId,
      data: { target, prototype },
    });

    if (!extensible && currentPrototype !== prototype) {
      throw new ProxyError(
        "Prototype cannot be changed because the target object is not extensible",
        proxy,
        nexoId,
      );
    }

    if (event.defaultPrevented) {
      // Throw error when returning a prototype that is not an object
      if (
        event.returnValue !== undefined &&
        typeof event.returnValue !== "object"
      ) {
        throw new ProxyError(
          "Cannot set the new prototype because it is not an object or null",
          proxy,
          nexoId,
        );
      }
      // Try applying the returned prototype to either the sandbox or the target
      if (typeof event.returnValue === "object") {
        return Reflect.setPrototypeOf(sandbox || target, event.returnValue);
      }
      // The event got prevented
      return false;
    }

    return Reflect.setPrototypeOf(sandbox || target, prototype);
  };
}
