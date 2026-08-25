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

export default function createHandlers(
  wrapper: nx.ProxyWrapper,
): ProxyHandler<object> {
  const handle = wrapper.pipeline.wrap(wrapper);

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
