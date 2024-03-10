import Nexo from "../Nexo.js";
declare namespace Nexo {
  type functionLike = (...args: unknown[]) => unknown;
  type traceable = object | functionLike;
  type objectKey = string | symbol;

  interface options {}

  interface data {
    options: options;
    counter: number;
    proxyMap: Map<string, WeakRef<Proxy>>;
  }

  interface Mock extends functionLike {}

  interface Proxy extends Mock {
    (...args: unknown[]): unknown;
    [K: objectKey]: unknown;
  }

  namespace proxy {
    namespace origin {
      interface proxyOrigin {
        name: string;
        proxy: Proxy;
      }

      interface get extends proxyOrigin {
        name: "get";
        key: objectKey;
      }

      interface set extends proxyOrigin {
        name: "set";
        key: objectKey;
        value: unknown;
      }

      interface deleteProperty extends proxyOrigin {
        name: "deleteProperty";
        key: objectKey;
      }

      interface apply extends proxyOrigin {
        name: "apply";
        args: unknown[];
        that: unknown;
      }

      interface construct extends proxyOrigin {
        name: "construct";
        args: unknown[];
      }
    }

    interface data {
      id: string;
      target: WeakRef<traceable> | void;
      scope: WeakRef<Nexo>;
      sandbox: Map<objectKey, unknown>;
    }
  }
}

export default Nexo;
