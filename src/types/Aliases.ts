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

    /** A function returning a proxy object. */
    type ResolveProxy = () => object;

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

    type ProxyEventSuffix =
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
      | "setPrototypeOf"
      | "lock"
      | "unlock"
      | "rename"
      | "manager"
      | "target";

    type EventMap = Record<string, FunctionLike>;
  }
}

export {};
