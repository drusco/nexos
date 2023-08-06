import { EventEmitter } from "events";

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Exotic {
  type traceable = object | FunctionLike;
  type key = string | symbol;

  interface Emulator extends EventEmitter {
    useRef(ref: key): Proxy;
    use(value?: any): Proxy;
    target(value?: any): any;
    parent(value?: traceable): undefined | Proxy;
    children(value?: traceable): Proxy[];
    ownKeys(value?: Exotic.traceable): Exotic.key[];
    revoke(value: Exotic.traceable): boolean;
    revoked(value: Exotic.traceable): boolean;
    entries(): Iterable<Exotic.Proxy>;
    entriesBefore(value: Exotic.traceable): Iterable<Exotic.Proxy>;
    entriesAfter(value: Exotic.traceable): Iterable<Exotic.Proxy>;
    refs: key[];
    active: number;
    void: number;
    length: number;
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
      revoked: boolean;
      mock: Mock;
      origin?: proxy.origin | undefined;
      scope: Emulator;
      sandbox: sandbox;
      refKey: key;
      next?: Proxy;
      prev?: Proxy;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace emulator {
    interface options {
      [x: string]: any;
    }

    interface refs {
      [x: key]: Proxy;
    }

    interface data {
      options: options;
      refs: refs;
      totalProxies: number;
      activeProxies: number;
      firstProxy?: Proxy;
      lastProxy?: Proxy;
    }
  }
}

export default Exotic;
