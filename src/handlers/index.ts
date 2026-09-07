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

  return {
    apply: guard(handle("apply", apply)),
    construct: guard(handle("construct", construct)),
    defineProperty: guard(handle("defineProperty", defineProperty)),
    deleteProperty: guard(handle("deleteProperty", deleteProperty)),
    get: guard(handle("get", get)),
    getOwnPropertyDescriptor: guard(
      handle("getOwnPropertyDescriptor", getOwnPropertyDescriptor),
    ),
    getPrototypeOf: guard(handle("getPrototypeOf", getPrototypeOf)),
    has: guard(handle("has", has)),
    isExtensible: guard(handle("isExtensible", isExtensible)),
    ownKeys: guard(handle("ownKeys", ownKeys)),
    preventExtensions: guard(handle("preventExtensions", preventExtensions)),
    set: guard(handle("set", set)),
    setPrototypeOf: guard(handle("setPrototypeOf", setPrototypeOf)),
  };
}
