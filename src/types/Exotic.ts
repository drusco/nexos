import { EventEmitter } from "events";

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Exotic {
  type traceable = object | FunctionLike;
  type namespace = string | symbol;

  interface Emulator extends EventEmitter {
    refs: namespace[];
    bind(x: namespace): Proxy;
    proxy(value?: any): Proxy;
    target(value?: any): any;
  }

  interface FunctionLike {
    (...args: any[]): void;
    [x: namespace]: any;
    [Symbol.iterator](): Iterator<any, any, undefined>;
  }

  interface Proxy extends FunctionLike {
    [x: namespace]: any;
    [Symbol.iterator](): Iterator<Proxy, any, undefined>;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace proxy {
    interface group {
      length: number;
      root: Exotic.Proxy;
    }

    interface origin {
      action: "get" | "set" | "construct" | "apply";
      proxy: Proxy;
      key?: namespace;
      value?: any;
      that?: any;
      args?: any[];
    }

    interface public {
      id: number;
      target?: any;
    }

    interface data extends public {
      revoke(): void;
      dummy: FunctionLike;
      origin?: proxy.origin;
      scope: Emulator;
      sandbox: { [x: namespace]: any };
      namespace: namespace;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace emulator {
    interface options {
      [x: string]: any;
    }

    interface bindings {
      [ns: namespace]: proxy.group;
    }

    interface data {
      options: options;
      bindings: bindings;
      itemCount: number;
      activeItems: number;
    }
  }
}

export default Exotic;
