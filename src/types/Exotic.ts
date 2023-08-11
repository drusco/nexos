declare namespace Exotic {
  type traceable = object;
  type key = string | symbol;
  type FunctionLike = (...args: any[]) => any;

  type payload = {
    value: any;
    encoded: boolean;
  };

  interface Emulator {
    use(value?: any): Proxy;
    useRef(ref: key, value?: any): Proxy;
    getId(value: traceable): number;
    target(value?: any): any;
    parent(value?: traceable): undefined | Proxy;
    values(value?: traceable): Proxy[];
    ownKeys(value?: traceable): key[];
    revoke(value: traceable): boolean;
    isRevoked(value: traceable): boolean;
    entries(): IterableIterator<Proxy>;
    entriesBefore(value: traceable): IterableIterator<Proxy>;
    entriesAfter(value: traceable): IterableIterator<Proxy>;
    encode(value: any): payload;
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
      firstProxy?: WeakRef<Proxy>;
      lastProxy?: WeakRef<Proxy>;
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
      action: "get" | "set" | "construct" | "apply";
      proxy: WeakRef<Proxy>;
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
      next?: WeakRef<Proxy>;
      prev?: WeakRef<Proxy>;
    }
  }
}

export default Exotic;
