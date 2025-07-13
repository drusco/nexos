import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";
import resolveProxy from "../utils/resolveProxy.js";

export default function apply(nexoId: symbol) {
  return (
    target: nx.FunctionLike,
    thisArg: unknown = undefined,
    args: nx.ArrayLike,
  ): unknown => {
    const [proxy, wrapper] = resolveProxy(target, nexoId);
    const { traceable, nexo } = wrapper;

    const event = new ProxyEvent<{
      target: nx.FunctionLike;
      thisArg: unknown;
      args: nx.ArrayLike;
      result?: nx.Proxy;
    }>("apply", {
      target: proxy,
      cancelable: true,
      data: {
        target,
        thisArg,
        args,
      },
    });

    if (event.defaultPrevented) {
      // return value from the prevented event
      return event.returnValue;
    }

    if (traceable && typeof target === "function") {
      // return result from the traceable function target
      try {
        return Reflect.apply(target, thisArg, args);
      } catch (error) {
        throw new ProxyError(error.message, proxy);
      }
    }

    // create a new proxy
    const result = nexo.create();
    // assign the previous proxy as the function return value
    event.data.result = result;

    return result;
  };
}
