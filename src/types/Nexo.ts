/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace Nexo {
  type arrayLike = unknown[];
  type traceable = NonNullable<object>;
  type objectKey = string | symbol;
  type plainObject = Record<objectKey, unknown>;
  type voidFunction = (...args: arrayLike) => void;
  type functionLike = (...args: arrayLike) => any;
  type constructable<T> = new (...args: arrayLike) => T;

  interface Proxy extends functionLike {
    new (...args: arrayLike): any;
    [x: objectKey]: any;
    name: any;
    apply: any;
    arguments: any;
    bind: any;
    call: any;
    caller: any;
    length: any;
    prototype: any;
    toString: any;
  }

  namespace proxy {
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

  namespace event {
    interface options<Target, Data> {
      target?: Target;
      data?: Data;
      cancelable?: boolean;
    }
  }
}

export default Nexo;
