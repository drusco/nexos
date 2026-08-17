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

    /**
     * Type-level map of event names to listener function signatures.
     *
     * @remarks
     * This is a compile-time description of an emitter's events, not a runtime
     * value. Concrete event maps (e.g. {@link ProxyEvents}) are supplied through
     * the `Events` generic of {@link EventEmitter}, {@link ProxyManager}, and
     * {@link ProxyWrapper} to type their `on`/`off`/`emit` calls.
     */
    type EventMap = Record<string, FunctionLike>;
  }
}

export {};
