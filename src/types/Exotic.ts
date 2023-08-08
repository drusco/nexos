// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Exotic {
  type traceable = object;
  type key = string | symbol;

  type payload = {
    value: any;
    encoded: boolean;
  };

  interface Emulator extends EventTarget {
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
    encode(value: any): Exotic.payload;
    refs: key[];
    active: number;
    revoked: number;
    length: number;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace emulator {
    interface options {
      [x: string]: any;
    }

    interface data {
      options: options;
      refs: Record<key, Proxy>;
      totalProxies: number;
      activeProxies: number;
      firstProxy?: Proxy;
      lastProxy?: Proxy;
    }
  }

  interface Mock {
    (...args: any[]): void;
    [x: key]: any;
    [Symbol.iterator](): Iterator<any>;
  }

  interface Proxy extends Mock {
    [Symbol.iterator](): Iterator<Proxy>;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace proxy {
    interface origin {
      action: "get" | "set" | "construct" | "apply";
      proxy: Proxy;
      key?: key;
      value?: any;
      that?: any;
      args?: any[];
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
      refKey?: key;
      next?: Proxy;
      prev?: Proxy;
    }
  }
}

export default Exotic;
