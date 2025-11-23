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
import ProxyPipeline from "../utils/ProxyPipeline.js";
import ProxyError from "../utils/ProxyError.js";

const pipe = new ProxyPipeline<nx.ProxyWrapper<object, nx.ProxyEvents>>();

pipe.use(({ context }, next) => {
  if (!context.locked) {
    return next();
  }
  const error = new ProxyError(
    "The proxy is locked and cannot be used.",
    context.proxy,
  );
  context.events?.emit("proxy.error", error);
  throw error;
});

export default function createHandlers(
  wrapper: nx.ProxyWrapper,
): ProxyHandler<object> {
  const handle = pipe.wrap(wrapper);

  return {
    apply: handle("apply", apply),
    construct: handle("construct", construct),
    defineProperty: handle("defineProperty", defineProperty),
    deleteProperty: handle("deleteProperty", deleteProperty),
    get: handle("get", get),
    getOwnPropertyDescriptor: handle(
      "getOwnPropertyDescriptor",
      getOwnPropertyDescriptor,
    ),
    getPrototypeOf: handle("getPrototypeOf", getPrototypeOf),
    has: handle("has", has),
    isExtensible: handle("isExtensible", isExtensible),
    ownKeys: handle("ownKeys", ownKeys),
    preventExtensions: handle("preventExtensions", preventExtensions),
    set: handle("set", set),
    setPrototypeOf: handle("setPrototypeOf", setPrototypeOf),
  };
}
