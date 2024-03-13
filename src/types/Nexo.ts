import Nexo from "../Nexo.js";

declare namespace Nexo {
  type functionLike = (...args: unknown[]) => unknown;
  type traceable = object | functionLike;
  type objectKey = string | symbol;

  interface options {}

  type data = {
    options: options;
    counter: number;
    proxyMap: Map<string, WeakRef<Proxy>>;
  };

  interface Mock extends functionLike {}

  interface Proxy extends Mock {
    (...args: unknown[]): unknown;
    [K: objectKey]: unknown;
  }

  namespace proxy {
    type data = {
      id: string;
      target: WeakRef<traceable> | void;
      scope: WeakRef<Nexo>;
      sandbox: Map<objectKey, unknown>;
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
