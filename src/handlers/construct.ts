import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";
import isTraceable from "../utils/isTraceable.js";

export default function construct(resolveProxy: nx.resolveProxy) {
  return (target: nx.FunctionLike, args: nx.ArrayLike): object => {
    const [proxy, wrapper] = resolveProxy();
    const { traceable, nexo } = wrapper;

    const event = new ProxyEvent<{
      target: nx.FunctionLike;
      args: nx.ArrayLike;
      result?: nx.Proxy;
    }>("construct", {
      target: proxy,
      cancelable: true,
      data: {
        target,
        args,
      },
    });

    if (event.defaultPrevented) {
      if (isTraceable(event.returnValue)) {
        // return value from the prevented event
        return event.returnValue;
      }
      throw new ProxyError(
        'Cannot return non-object on "construct" proxy trap',
        proxy,
      );
    }

    if (traceable && typeof target === "function") {
      // return instance from the traceable constructor target
      try {
        return Reflect.construct(target, args);
      } catch (error) {
        throw new ProxyError(error.message, proxy);
      }
    }

    // create a new proxy
    const result = nexo.create();
    // assign the previous proxy as the constructed object
    event.data.result = result;

    return result;
  };
}
