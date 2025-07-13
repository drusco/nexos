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
  nexoId: symbol,
): ProxyHandler<nx.Traceable> {
  return {
    apply: apply(nexoId),
    construct: construct(nexoId),
    defineProperty: defineProperty(nexoId),
    deleteProperty: deleteProperty(nexoId),
    get: get(nexoId),
    getOwnPropertyDescriptor: getOwnPropertyDescriptor(nexoId),
    getPrototypeOf: getPrototypeOf(nexoId),
    has: has(nexoId),
    isExtensible: isExtensible(nexoId),
    ownKeys: ownKeys(nexoId),
    preventExtensions: preventExtensions(nexoId),
    set: set(nexoId),
    setPrototypeOf: setPrototypeOf(nexoId),
  };
}
