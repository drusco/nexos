import getProxyWrapper from "../utils/getProxyWrapper.js";
import ProxyError from "../utils/ProxyError.js";
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

const useProxy = (resolveProxy: nx.ResolveProxy) => {
  return <T extends nx.FunctionLike<unknown[], ReturnType<T>>>(
    createHandler: nx.FunctionLike<[nx.ResolveProxy], T>,
  ): T => {
    const handler = createHandler(resolveProxy);
    const next = (...args: Parameters<T>): ReturnType<T> => {
      const proxy = resolveProxy();
      const wrapper = getProxyWrapper(proxy);

      if (wrapper.locked) {
        throw new ProxyError("The proxy is locked and cannot be used.", proxy);
      }

      return handler(...args);
    };

    return next as T;
  };
};

export default function createHandlers(
  resolveProxy: nx.ResolveProxy,
): ProxyHandler<object> {
  const useHandler = useProxy(resolveProxy);

  return {
    apply: useHandler(apply),
    construct: useHandler(construct),
    defineProperty: useHandler(defineProperty),
    deleteProperty: useHandler(deleteProperty),
    get: useHandler(get),
    getOwnPropertyDescriptor: useHandler(getOwnPropertyDescriptor),
    getPrototypeOf: useHandler(getPrototypeOf),
    has: useHandler(has),
    isExtensible: useHandler(isExtensible),
    ownKeys: useHandler(ownKeys),
    preventExtensions: useHandler(preventExtensions),
    set: useHandler(set),
    setPrototypeOf: useHandler(setPrototypeOf),
  };
}
