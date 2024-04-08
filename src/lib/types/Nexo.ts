import Nexo from "../Nexo.js";
import ProxyWrapper from "../ProxyWrapper.js";

declare namespace Nexo {
  type arrayLike = unknown[];
  type functionLike = (...args: arrayLike) => unknown;
  type traceable = NonNullable<object>;
  type objectKey = string | symbol;
  type plainObject = Record<objectKey, unknown>;

  interface Wrapper extends ProxyWrapper {
    (...args: arrayLike): unknown;
  }

  interface Proxy extends functionLike {}

  namespace proxy {
    type data = {
      id: string;
      target: void | traceable;
      scope: Nexo;
      sandbox: Map<objectKey, PropertyDescriptor>;
      wrapper: Wrapper;
      isExtensible: boolean;
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
