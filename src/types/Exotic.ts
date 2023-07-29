import { EventEmitter } from "events";

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Exotic {
  type Traceable = object | FunctionLike;
  type Namespace = string | symbol;

  interface Emulator extends EventEmitter {
    use(target?: unknown): Proxy;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  interface FunctionLike extends Function {
    (...args: any[]): void;
  }

  interface Proxy extends FunctionLike {
    [x: string]: any;
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
      item: unknown;
      key?: string;
      value?: unknown;
      that?: unknown;
      args?: unknown[];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace emulator {
    interface options {
      [x: string]: unknown;
    }

    interface bindings {
      [ns: Namespace]: proxy.group;
    }

    interface private {
      options: options;
      bindings: bindings;
      itemCount: number;
      activeItems: number;
      groupCount: number;
    }

    interface itemPublicData {
      id: number;
      target?: any;
    }

    interface item extends itemPublicData {
      dummy: FunctionLike;
      origin?: proxy.origin | undefined;
      revoke(): void;
      scope: Emulator;
      sandbox: object;
      namespace: Namespace;
    }
  }
}

export default Exotic;
