declare namespace Exotic {
  type traceable = object;
  type key = string | symbol;

  type payload = {
    value: any;
    encoded: boolean;
  };

  interface Emulator extends EventTarget {
    use(value?: any): Proxy;
    useRef(ref: key, value?: any): Proxy;
    getId(value: traceable): number;
    target(value?: any): any;
    parent(value?: traceable): undefined | Proxy;
    values(value?: traceable): Proxy[];
    ownKeys(value?: traceable): key[];
    revoke(value: traceable): boolean;
    isRevoked(value: traceable): boolean;
    entries(): IterableIterator<Exotic.Proxy>;
    entriesBefore(value: traceable): IterableIterator<Exotic.Proxy>;
    entriesAfter(value: traceable): IterableIterator<Exotic.Proxy>;
    encode(value: any): Exotic.payload;
    get(value?: any): Promise<any>;
    refs: key[];
    active: number;
    revoked: number;
    length: number;
  }

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
    [Symbol.iterator](): IterableIterator<any>;
  }

  interface Proxy extends Mock {
    [Symbol.iterator](): IterableIterator<Proxy>;
  }

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
