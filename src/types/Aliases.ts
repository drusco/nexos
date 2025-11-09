declare global {
  namespace nx {
    /** A valid object property key: a string or a symbol. */
    type ObjectKey = string | symbol;

    /**
     * Represents any function type.
     *
     * @typeParam A - Tuple type of accepted arguments.
     * @typeParam R - Return type of the function.
     * @typeParam T - Type of the `this` context.
     */
    type FunctionLike<
      A extends unknown[] = unknown[],
      R = unknown,
      T = unknown,
    > = (this: T, ...args: A) => R;

    /** A function returning a proxy or `undefined`. */
    type ResolveProxy = () => Proxy | undefined;

    /** A proxy-wrapped object or function. */
    type ProxyTarget<T extends object = undefined> = T extends undefined
      ? Proxy
      : T extends FunctionLike
        ? T & {
            /** Allow custom properties on function targets */
            [K: ObjectKey]: unknown;
          }
        : T;

    type ProxyHandlerName =
      | "get"
      | "has"
      | "deleteProperty"
      | "getOwnPropertyDescriptor"
      | "set"
      | "defineProperty"
      | "apply"
      | "construct"
      | "getPrototypeOf"
      | "isExtensible"
      | "ownKeys"
      | "preventExtensions"
      | "setPrototypeOf";
  }
}

export {};
