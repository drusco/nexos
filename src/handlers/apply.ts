import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";
import { createDeferred, resolveWith, rejectWith } from "../utils/deferred.js";

export default function apply(resolveProxy: nx.resolveProxy) {
  return (
    target: nx.FunctionLike,
    thisArg: unknown = undefined,
    args: nx.ArrayLike,
  ): unknown => {
    const [proxy, wrapper] = resolveProxy();
    const { traceable, nexo, sandbox } = wrapper;
    const deferred = createDeferred<nx.FunctionLike>();

    const event = new ProxyEvent<nx.ProxyApplyEvent["data"]>("apply", {
      target: proxy,
      cancelable: true,
      data: {
        target: sandbox || target,
        thisArg,
        args,
        result: deferred.promise,
      },
    }) as nx.ProxyApplyEvent;

    if (event.defaultPrevented) {
      // return value from the prevented event
      const returnValue = event.returnValue;
      return resolveWith(deferred.resolve, returnValue);
    }

    if (traceable && typeof target === "function") {
      // return result from the traceable function target
      try {
        const result = Reflect.apply(target, thisArg, args);
        return resolveWith(deferred.resolve, result);
      } catch (error) {
        const proxyError = new ProxyError(error.message, proxy);
        return rejectWith(deferred.resolve, proxyError);
      }
    }

    // defaults to a new proxy
    return resolveWith(deferred.resolve, nexo.create());
  };
}
