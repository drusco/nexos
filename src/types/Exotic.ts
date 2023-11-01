declare namespace Exotic {
  type traceable = object | FunctionLike;
  type key = string;
  type proxyPayload = string;
  type payload = string;
  type FunctionLike = (...args: unknown[]) => unknown;

  interface Emulator {}

  namespace emulator {
    interface options {
      traceErrors: boolean;
      stackTraceLimit: number;
    }

    interface data {
      options: options;
      links: Record<payload, Proxy>;
      counter: number;
      proxySet: Set<Proxy>;
    }
  }

  interface Mock extends FunctionLike {
    [Symbol.iterator](): IterableIterator<Proxy>;
  }

  namespace mock {
    interface prototype {
      [Symbol.iterator](): IterableIterator<Proxy>;
    }
  }

  interface Proxy extends Mock {
    (...args: any[]): void;
    [x: key]: any;
  }

  namespace proxy {
    interface origin {
      action?: "get" | "set" | "build" | "apply" | "exec" | "link";
      proxy?: Proxy;
      key?: key;
      value?: any;
      that?: any;
      args?: any[];
      external?: boolean;
    }

    interface data {
      revoke(): void;
      id: string;
      revoked: boolean;
      mock: Mock;
      scope: any;
      sandbox: Record<key, Proxy>;
      target?: any;
      origin?: origin;
      link?: key;
    }
  }
}

export default Exotic;
