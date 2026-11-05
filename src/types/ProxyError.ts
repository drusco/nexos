declare global {
  namespace nx {
    /** Error specific to proxy operations. */
    interface ProxyError extends Error {
      /** The object that caused the error. */
      readonly target: object;
      readonly name: string;
    }
  }
}

export {};
