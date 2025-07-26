import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";
import Nexo from "../Nexo.js";
import createDeferred from "../utils/createDeferred.js";

export default function construct(resolveProxy: nx.resolveProxy) {
  return (target: nx.FunctionLike, args: nx.ArrayLike): object => {
    const [proxy, wrapper] = resolveProxy();
    const { traceable, nexo } = wrapper;
    const deferred = createDeferred<nx.FunctionLike<[], object>>();

    const event = new ProxyEvent<nx.ProxyConstructEvent["data"]>("construct", {
      target: proxy,
      cancelable: true,
      data: {
        target,
        args,
        result: deferred.promise,
      },
    });

    if (event.defaultPrevented) {
      if (Nexo.isTraceable(event.returnValue)) {
        // return value from the prevented event
        const returnValue = event.returnValue;
        deferred.resolve(() => returnValue);
        return returnValue;
      }
      throw new ProxyError(
        'Cannot return non-object on "construct" proxy trap',
        proxy,
      );
    }

    if (traceable && typeof target === "function") {
      // return instance from the traceable constructor target
      try {
        const result = Reflect.construct(target, args);
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

    // create a new proxy
    const proxyResult = nexo.create();

    deferred.resolve(() => proxyResult);

    return proxyResult;
  };
}
