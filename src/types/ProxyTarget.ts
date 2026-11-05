declare global {
  namespace nx {
    /** A proxy-wrapped object or function. */
    type ProxyTarget<T extends object> =
      T extends NonNullable<T>
        ? T extends FunctionLike
          ? T & {
              /** Allow custom properties on function targets */
              [K: ObjectKey]: unknown;
            }
          : T
        : Proxy;
  }
}
