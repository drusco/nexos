import type nx from "../types/Nexo.js";
import map from "../utils/maps.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";

const setPrototypeOf = (target: nx.traceable, prototype: object): boolean => {
  const proxy = map.tracables.get(target);
  const { sandbox } = map.proxies.get(proxy);
  const extensible = Reflect.isExtensible(target);
  const currentPrototype = Reflect.getPrototypeOf(target);

  const event = new ProxyEvent("setPrototypeOf", {
    target: proxy,
    cancelable: true,
    data: { target, prototype },
  });

  if (!extensible && currentPrototype !== prototype) {
    throw new ProxyError(
      "Prototype cannot be changed because the target object is not extensible",
      proxy,
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

export default setPrototypeOf;
