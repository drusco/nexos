import type * as nx from "../types/Nexo.js";
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
  resolveProxy: nx.resolveProxy,
): ProxyHandler<nx.Traceable> {
  return {
    apply: apply(resolveProxy),
    construct: construct(resolveProxy),
    defineProperty: defineProperty(resolveProxy),
    deleteProperty: deleteProperty(resolveProxy),
    get: get(resolveProxy),
    getOwnPropertyDescriptor: getOwnPropertyDescriptor(resolveProxy),
    getPrototypeOf: getPrototypeOf(resolveProxy),
    has: has(resolveProxy),
    isExtensible: isExtensible(resolveProxy),
    ownKeys: ownKeys(resolveProxy),
    preventExtensions: preventExtensions(resolveProxy),
    set: set(resolveProxy),
    setPrototypeOf: setPrototypeOf(resolveProxy),
  };
}
