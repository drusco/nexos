import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";
import createDeferred from "../utils/createDeferred.js";

export default function apply(resolveProxy: nx.resolveProxy) {
  return (
    target: nx.FunctionLike,
    thisArg: unknown = undefined,
    args: nx.ArrayLike,
  ): unknown => {
    const [proxy, wrapper] = resolveProxy();
    const { traceable, nexo } = wrapper;
    const deferred = createDeferred<nx.FunctionLike>();

    const event = new ProxyEvent<nx.ProxyApplyEvent["data"]>("apply", {
      target: proxy,
      cancelable: true,
      data: {
        target,
        thisArg,
        args,
        result: deferred.promise,
      },
    });

    if (event.defaultPrevented) {
      // return value from the prevented event
      const returnValue = event.returnValue;
      deferred.resolve(() => returnValue);
      return returnValue;
    }

    if (traceable && typeof target === "function") {
      // return result from the traceable function target
      try {
        const result = Reflect.apply(target, thisArg, args);
        deferred.resolve(() => result);
        return result;
      } catch (error) {
        const proxyError = new ProxyError(error.message, proxy);
        deferred.resolve(() => {
          throw proxyError;
        });
        throw proxyError;
      }
    }

    // defaults to a new proxy
    const proxyResult = nexo.create();
    deferred.resolve(() => proxyResult);

    return proxyResult;
  };
}
