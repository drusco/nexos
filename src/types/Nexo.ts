import Nexo from "../Nexo.js";
import EventEmitter from "node:events";

declare namespace Nexo {
  type arrayLike = unknown[];
  type functionLike = (...args: arrayLike) => unknown;
  type traceable = NonNullable<object>;
  type objectKey = string | symbol;
  type plainObject = Record<objectKey, unknown>;

  interface Proxy extends functionLike {
    (...args: arrayLike): unknown;
  }

  namespace proxy {
    type data = {
      id: string;
      fn: functionLike;
      target: void | traceable;
      scope: Nexo;
      sandbox: Map<objectKey, PropertyDescriptor>;
      isExtensible: boolean;
      events: EventEmitter;
      revoke: () => void;
    };

    type handler =
      | "update"
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

  namespace events {
    interface options<Target, Data> {
      target?: Target;
      data?: Data;
      cancellable?: boolean;
    }
  }
}

export default Nexo;
