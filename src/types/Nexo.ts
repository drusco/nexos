import Nexo from "../Nexo.js";
import PxEvent from "../events/ProxyEvent.js";

declare namespace Nexo {
  type functionLike = (...args: unknown[]) => unknown;
  type traceable = object | functionLike;
  type objectKey = string | symbol;
  type ProxyEvent = PxEvent;

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
    interface data {
      id: string;
      target: WeakRef<traceable> | void;
      scope: WeakRef<Nexo>;
      sandbox: Map<objectKey, unknown>;
    }
  }

  namespace events {
    type name =
      | "handler.get"
      | "handler.set"
      | "handler.defineProperty"
      | "handler.deleteProperty"
      | "handler.getOwnPropertyDescriptor"
      | "handler.getPrototypeOf"
      | "handler.apply"
      | "handler.construct";

    interface getHandler extends ProxyEvent {
      name: "handler.get";
      key: objectKey;
    }

    interface setHandler extends ProxyEvent {
      name: "handler.set";
      key: objectKey;
      value: unknown;
    }

    interface definePropertyHandler extends ProxyEvent {
      name: "handler.defineProperty";
      key: objectKey;
    }

    interface deletePropertyHandler extends ProxyEvent {
      name: "handler.deleteProperty";
      key: objectKey;
    }

    interface getOwnPropertyDescriptorHandler extends ProxyEvent {
      name: "handler.getOwnPropertyDescriptor";
      key: objectKey;
    }

    interface getPrototypeOfHandler extends ProxyEvent {}

    interface applyHandler extends ProxyEvent {
      name: "handler.apply";
      args: unknown[];
      that: unknown;
    }

    interface constructHandler extends ProxyEvent {
      name: "handler.construct";
      args: unknown[];
    }
  }
}

export default Nexo;
