/* eslint-disable @typescript-eslint/no-explicit-any */
import Nexo from "../Nexo.js";
import NexoEmitter from "../events/NexoEmitter.js";

declare namespace Nexo {
  type arrayLike = unknown[];
  type traceable = NonNullable<object>;
  type objectKey = string | symbol;
  type plainObject = Record<objectKey, unknown>;
  type voidFunction = (...args: arrayLike) => void;
  type functionLike = (...args: arrayLike) => any;

  interface Proxy extends functionLike {
    new (...args: arrayLike): any;
    [x: objectKey]: any;
  }

  namespace proxy {
    type data = {
      id: string;
      target: void | traceable;
      scope: Nexo;
      sandbox: Map<objectKey, PropertyDescriptor>;
      isExtensible: boolean;
      events: NexoEmitter;
      fn: voidFunction;
      revoke: voidFunction;
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

  namespace events {
    interface options<Target, Data> {
      target?: Target;
      data?: Data;
      cancellable?: boolean;
    }
  }
}

export default Nexo;
