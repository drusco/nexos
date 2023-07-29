import { EventEmitter } from "events";

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Exotic {
  type traceable = object | FunctionLike;
  type namespace = string | symbol;

  interface Emulator extends EventEmitter {
    use(value?: unknown): Proxy;
    namespace(namespace: namespace): Proxy;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  interface FunctionLike extends Function {
    (...args: any[]): void;
  }

  interface Proxy extends FunctionLike {
    [x: namespace]: any;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace proxy {
    interface group {
      length: number;
      first: Exotic.Proxy;
      last: Exotic.Proxy;
    }

    interface origin {
      action: "get" | "set" | "construct" | "apply";
      proxy: Proxy;
      key?: namespace;
      value?: any;
      that?: any;
      args?: any[];
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
      groupCount: number;
    }

    interface proxy {
      id: number;
      target?: any;
    }

    interface proxyData extends proxy {
      revoke(): void;
      dummy: FunctionLike;
      origin?: proxy.origin;
      scope: Emulator;
      sandbox: { [x: namespace]: any };
      namespace: namespace;
    }
  }
}

export default Exotic;
