import Nexo from "../Nexo.js";
import EventEmitter from "events";

declare namespace Nexo {
  type arrayLike = unknown[];
  type functionLike = (...args: arrayLike) => unknown;
  type traceable = object;
  type objectKey = string | symbol;
  type plainObject = Record<objectKey, unknown>;

  interface Mock extends EventEmitter {
    (...args: arrayLike): unknown;
  }

  interface Proxy extends functionLike {}

  namespace proxy {
    type data = {
      id: string;
      target: WeakRef<traceable> | void;
      scope: WeakRef<Nexo>;
      sandbox: Map<objectKey, unknown>;
      mock: WeakRef<Mock>;
      isExtensible: boolean;
    };

    type handler =
      | "get"
      | "has"
      | "deleteProperty"
      | "getOwnPropertyDescriptor"
      | "set"
      | "defineProperty"
      | "apply"
      | "construct"
      | "getPrototypeOf"
      | "isExtensible"
      | "ownKeys"
      | "preventExtensions"
      | "setPrototypeOf";
  }
}

export default Nexo;
