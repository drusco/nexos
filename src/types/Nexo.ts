import Nexo from "../Nexo.js";
import PxEvent from "../events/ProxyEvent.js";

declare namespace Nexo {
  type functionLike = (...args: unknown[]) => unknown;
  type traceable = object | functionLike;
  type objectKey = string | symbol;
  type ProxyEvent = PxEvent;

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
    };

    type handler =
      // getters
      | "get"
      | "has"
      | "deleteProperty"
      | "getOwnPropertyDescriptor"
      | "get"
      | "has"
      | "deleteProperty"
      | "getOwnPropertyDescriptor"
      // setters
      | "set"
      | "defineProperty"
      // function calls
      | "apply"
      // class instances
      | "construct"
      // objects
      | "getPrototypeOf";
  }
}

export default Nexo;
