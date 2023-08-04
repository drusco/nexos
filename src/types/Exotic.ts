import { EventEmitter } from "events";

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Exotic {
  type traceable = object | FunctionLike;
  type key = string | symbol;

  interface Emulator extends EventEmitter {
    keys: key[];
    bind(x: key): Proxy;
    proxy(value?: any): Proxy;
    target(value?: any): any;
  }

  type FunctionLike = (...args: any[]) => void;

  interface Mock extends FunctionLike {
    [x: key]: any;
    [Symbol.iterator](): Iterator<any, any, undefined>;
  }

  interface Proxy extends Mock {
    [Symbol.iterator](): Iterator<Proxy, any, undefined>;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace proxy {
    interface group {
      length: number;
      root: Exotic.Proxy;
    }

    interface sandbox {
      [x: key]: any;
    }

    interface origin {
      action: "get" | "set" | "construct" | "apply";
      proxy: Proxy;
      key?: key;
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
      mock: Mock;
      origin?: proxy.origin;
      scope: Emulator;
      sandbox: sandbox;
      binding: key;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace emulator {
    interface options {
      [x: string]: any;
    }

    interface bindings {
      [x: key]: proxy.group;
    }

    interface data {
      options: options;
      keys: bindings;
      totalProxies: number;
      activeProxies: number;
    }
  }
}

export default Exotic;
