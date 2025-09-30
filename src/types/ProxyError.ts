declare global {
  namespace nx {
    /** Error specific to proxy operations. */
    interface ProxyError extends Error {
      /** Proxy instance that caused the error. */
      readonly proxy: Proxy;
      readonly name: string;
    }
  }
}

export {};
