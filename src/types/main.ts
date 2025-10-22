declare global {
  namespace nx {
    /** A non-null object that can be tracked as a proxy target. */
    type Traceable = NonNullable<object>;

    /** A valid object property key: a string or a symbol. */
    type ObjectKey = string | symbol;

    /**
     * Represents any function type.
     *
     * @typeParam Args - Tuple type of accepted arguments.
     * @typeParam Return - Return type of the function.
     * @typeParam ThisArg - Type of the `this` context.
     */
    type FunctionLike<
      Args extends unknown[] = unknown[],
      Return = unknown,
      ThisArg = unknown,
    > = (this: ThisArg, ...args: Args) => Return;

    /** A function returning a proxy or `undefined`. */
    type resolveProxy = FunctionLike<[], Proxy | undefined>;
  }
}

export {};
