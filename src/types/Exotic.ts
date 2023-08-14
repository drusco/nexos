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
    encode(value: any): payload;
    get(value?: any): Promise<any>;
    kill(): void;
    refs: key[];
    active: number;
    revoked: number;
    length: number;
    [Symbol.iterator](): IterableIterator<Proxy>;
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
      proxy?: Proxy;
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
      key?: key;
    }
  }
}

export default Exotic;
