declare global {
  namespace nx {
    /**
     * A specialized map that stores weak references to {@link Traceable} values,
     * with built-in event emitting capabilities.
     *
     * Each operation on the map can emit lifecycle events through an attached
     * {@link EventEmitter}. By default, the map provides a no-op emitter,
     * but a custom emitter can be set or removed.
     *
     * @typeParam Type - The type of {@link Traceable} values stored.
     */
    interface TraceableMap<Type extends Traceable>
      extends Map<string, WeakRef<Type>>,
        EventEmittable {
      /** Removes entries whose `WeakRef` targets have been garbage collected. */
      release(): void;
    }
  }
}

export {};
