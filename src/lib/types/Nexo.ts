import ProxyNexo from "../ProxyNexo.js";
import EventEmitter from "node:events";

declare namespace Nexo {
  type arrayLike = unknown[];
  type functionLike = (...args: arrayLike) => unknown;
  type traceable = object | functionLike;
  type objectKey = string | symbol;
  type plainObject = Record<objectKey, unknown>;

  interface Mock extends EventEmitter {
    (...args: arrayLike): unknown;
  }

  interface Proxy extends functionLike {}

  namespace proxy {
    type ref = WeakRef<Proxy>;
    type map = Map<string, ref>;

    type data = {
      id: string;
      target: WeakRef<traceable> | void;
      scope: WeakRef<ProxyNexo>;
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
