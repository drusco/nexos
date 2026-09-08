import apply from "./apply.js";
import construct from "./construct.js";
import defineProperty from "./defineProperty.js";
import deleteProperty from "./deleteProperty.js";
import get from "./get.js";
import getOwnPropertyDescriptor from "./getOwnPropertyDescriptor.js";
import getPrototypeOf from "./getPrototypeOf.js";
import has from "./has.js";
import isExtensible from "./isExtensible.js";
import ownKeys from "./ownKeys.js";
import preventExtensions from "./preventExtensions.js";
import set from "./set.js";
import setPrototypeOf from "./setPrototypeOf.js";
import ProxyError from "../utils/ProxyError.js";
import ProxyEvent from "../events/ProxyEvent.js";
import emitProxyEvent from "../utils/emitProxyEvent.js";

export default function createHandlers(
  wrapper: nx.ProxyWrapper,
): ProxyHandler<object> {
  const handle = wrapper.pipeline.wrap(wrapper);

  /** Rejects a trap invocation while the proxy is locked. */
  const guard = <K extends keyof ProxyHandler<object>>(
    trap: nx.ProxyTrap<K>,
  ): nx.ProxyTrap<K> =>
    ((...args: Parameters<ProxyHandler<object>[K]>) => {
      if (wrapper.locked) {
        const error = new ProxyError(
          "The proxy is locked and cannot be used.",
          wrapper.proxy,
        );

        wrapper.events?.emit("proxy.error", error);
        throw error;
      }

      return trap(...args);
    }) as nx.ProxyTrap<K>;

  /** Emits a uniform before/after observation pair around a trap. */
  const observe = <K extends keyof ProxyHandler<object>>(
    trap: K,
    handler: (context: nx.ProxyWrapper) => nx.ProxyTrap<K>,
  ): nx.ProxyTrap<K> => {
    const run = handle(trap, handler);

    return guard(((...args: Parameters<ProxyHandler<object>[K]>) => {
      const { proxy } = wrapper;

      emitProxyEvent(
        wrapper,
        new ProxyEvent("before", {
          target: proxy,
          cancelable: false,
          data: { trap, args },
        }),
      );

      const result = run(...args);

      emitProxyEvent(
        wrapper,
        new ProxyEvent("after", {
          target: proxy,
          cancelable: false,
          data: { trap, args, result },
        }),
      );

      return result;
    }) as nx.ProxyTrap<K>);
  };

  return {
    apply: observe("apply", apply),
    construct: observe("construct", construct),
    defineProperty: observe("defineProperty", defineProperty),
    deleteProperty: observe("deleteProperty", deleteProperty),
    get: observe("get", get),
    getOwnPropertyDescriptor: observe(
      "getOwnPropertyDescriptor",
      getOwnPropertyDescriptor,
    ),
    getPrototypeOf: observe("getPrototypeOf", getPrototypeOf),
    has: observe("has", has),
    isExtensible: observe("isExtensible", isExtensible),
    ownKeys: observe("ownKeys", ownKeys),
    preventExtensions: observe("preventExtensions", preventExtensions),
    set: observe("set", set),
    setPrototypeOf: observe("setPrototypeOf", setPrototypeOf),
  };
}
