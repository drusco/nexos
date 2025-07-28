import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";
import Nexo from "../Nexo.js";
import { createDeferred, resolveWith, rejectWith } from "../utils/deferred.js";

export default function construct(resolveProxy: nx.resolveProxy) {
  return (target: nx.FunctionLike, args: nx.ArrayLike): object => {
    const [proxy, wrapper] = resolveProxy();
    const { traceable, nexo, sandbox } = wrapper;
    const deferred = createDeferred<nx.FunctionLike<[], object>>();

    const event = new ProxyEvent<nx.ProxyConstructEvent["data"]>("construct", {
      target: proxy,
      cancelable: true,
      data: {
        target: sandbox || target,
        args,
        result: deferred.promise,
      },
    }) as nx.ProxyConstructEvent;

    if (event.defaultPrevented) {
      if (Nexo.isTraceable(event.returnValue)) {
        // return value from the prevented event
        const returnValue = event.returnValue;
        return resolveWith(deferred.resolve, returnValue);
      }
      return rejectWith(
        deferred.resolve,
        new ProxyError(
          'Cannot return non-object on "construct" proxy trap',
          proxy,
        ),
      );
    }

    if (traceable && typeof target === "function") {
      // return instance from the traceable constructor target
      try {
        const result = Reflect.construct(target, args);
        return resolveWith(deferred.resolve, result);
      } catch (error) {
        return rejectWith(
          deferred.resolve,
          new ProxyError(error.message, proxy),
        );
      }
    }

    // create a new proxy
    return resolveWith(deferred.resolve, nexo.create());
  };
}
