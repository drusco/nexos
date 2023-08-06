import { EventEmitter } from "events";

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Exotic {
  type traceable = object | FunctionLike;
  type key = string | symbol;

  interface Emulator extends EventEmitter {
    use(value?: any): Proxy;
    useRef(ref: key): Proxy;
    getId(value: traceable): number;
    target(value?: any): any;
    parent(value?: traceable): undefined | Proxy;
    children(value?: traceable): Proxy[];
    ownKeys(value?: traceable): key[];
    revoke(value: traceable): boolean;
    isRevoked(value: traceable): boolean;
    entries(): Iterable<Proxy>;
    entriesBefore(value: traceable): Iterable<Proxy>;
    entriesAfter(value: traceable): Iterable<Proxy>;
    refs: key[];
    active: number;
    revoked: number;
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

    interface data {
      id: number;
      target?: any;
      revoked: boolean;
      mock: Mock;
      origin?: origin | undefined;
      scope: Emulator;
      sandbox: sandbox;
      refKey: key;
      next?: Proxy;
      prev?: Proxy;
      revoke(): void;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace emulator {
    type options = Record<string, any>;
    type refs = Record<key, Proxy>;

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
