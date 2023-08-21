import EventEmitter from "events";

declare namespace Exotic {
  type traceable = object | FunctionLike;
  type key = string;
  type FunctionLike = (...args: any[]) => any;

  interface Emulator extends EventEmitter {
    use(value?: any): Proxy;
    useRef(ref: key, value?: any): Proxy;
    include(origin: proxy.origin, target?: any): any;
    target(value?: any): any;
    parent(value?: traceable): undefined | Proxy;
    values(value?: traceable): Proxy[];
    keys(value?: traceable): key[];
    revoke(value: traceable): boolean;
    revokeAll(): void;
    isRevoked(value: traceable): boolean;
    entries(): IterableIterator<Proxy>;
    encode(value: any): any;
    decode(value: any): any;
    get(value?: any): Promise<any>;
    refs: key[];
    active: number;
    length: number;
  }

  namespace emulator {
    interface options {
      responseTimeout: number;
    }

    interface data {
      options: options;
      refs: Record<key, Proxy>;
      totalProxies: number;
      activeProxies: number;
    }
  }

  interface Mock extends FunctionLike {
    [Symbol.iterator](): IterableIterator<Proxy>;
  }

  interface Proxy extends Mock {
    (...args: any[]): void;
    [x: key]: any;
  }

  namespace proxy {
    interface origin {
      action?: "get" | "set" | "construct" | "apply";
      proxy?: Proxy;
      key?: key;
      value?: any;
      that?: any;
      args?: any[];
      ref?: key;
    }

    interface data {
      revoke(): void;
      id: number;
      revoked: boolean;
      mock: Mock;
      scope: Emulator;
      sandbox: Record<key, any>;
      target?: any;
      origin?: origin;
      key?: key;
    }
  }
}

export default Exotic;
