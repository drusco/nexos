import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import { createDeferred, resolveWith } from "../utils/deferred.js";

export default function get(resolveProxy: nx.resolveProxy) {
  return (target: nx.Traceable, property: nx.ObjectKey): unknown => {
    const [proxy, wrapper] = resolveProxy();
    const { sandbox, nexo } = wrapper;
    const deferred = createDeferred<nx.FunctionLike<[], unknown>>();

    const event = new ProxyEvent<nx.ProxyGetEvent["data"]>("get", {
      target: proxy,
      cancelable: true,
      data: {
        target: sandbox || target,
        property,
        result: deferred.promise,
      },
    }) as nx.ProxyGetEvent;

    if (event.defaultPrevented) {
      return resolveWith(deferred.resolve, event.returnValue);
    }

    if (!sandbox) {
      return resolveWith(deferred.resolve, Reflect.get(target, property));
    }

    if (Reflect.has(sandbox, property)) {
      // return existing value on the sandbox
      return resolveWith(deferred.resolve, Reflect.get(sandbox, property));
    } else {
      // returns new proxy
      return resolveWith(deferred.resolve, nexo.create());
    }
  };
}
