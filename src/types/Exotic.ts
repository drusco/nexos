declare namespace Exotic {
  type FunctionLike = (...args: unknown[]) => unknown;
  type traceable = object | FunctionLike;

  interface Emulator {}

  namespace emulator {
    interface options {
      traceErrors: boolean;
      stackTraceLimit: number;
    }

    interface data {
      options: options;
      links: Record<string, Proxy>;
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
    [x: string]: any;
  }

  namespace proxy {
    interface origin {
      action?: "get" | "set" | "build" | "apply" | "exec" | "link";
      proxy?: Proxy;
      key?: string;
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
      sandbox: Record<string, Proxy>;
      target?: any;
      origin?: origin;
      link?: string;
    }
  }
}

export default Exotic;
