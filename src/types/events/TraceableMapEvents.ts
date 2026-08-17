declare global {
  namespace nx {
    interface MapEvent<K, V extends object> extends Event<Map<K, WeakRef<V>>> {}

    interface MapClearEvent<K, V extends object> extends MapEvent<K, V> {}

    interface MapDeleteEvent<K, V extends object> extends MapEvent<K, V> {
      data: {
        readonly key: K;
        readonly released: boolean;
      };
    }

    interface MapSetEvent<K, V extends object> extends MapEvent<K, V> {
      data: {
        readonly key: K;
        readonly value: WeakRef<V>;
      };
    }

    /** Map of available `traceable` map event names. */
    type TraceableMapEvents<K, V extends object> = {
      set: (event: MapSetEvent<K, V>) => void;
      delete: (event: MapDeleteEvent<K, V>) => void;
      clear: (event: MapClearEvent<K, V>) => void;
    };
  }
}

export {};
