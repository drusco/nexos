import Nexo from "../Nexo.js";
import EventEmitter from "node:events";

declare namespace Nexo {
  type functionLike = (...args: unknown[]) => unknown;
  type traceable = object | functionLike;
  type objectKey = string | symbol;

  interface options {}

  interface Mock extends EventEmitter {
    (...args: unknown[]): unknown;
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

    type handlerName =
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
