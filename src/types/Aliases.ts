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
    type ResolveProxy = () => proxy | undefined;
  }
}

export {};
