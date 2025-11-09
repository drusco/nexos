declare global {
  namespace nx {
    interface MapEvent<K, V> extends Event<Map<K, V>> {}

    interface MapClearEvent<K, V> extends MapEvent<K, V> {}

    interface MapDeleteEvent<K, V> extends MapEvent<K, V> {
      data: {
        readonly key: K;
        readonly released: boolean;
      };
    }

    interface MapSetEvent<K, V> extends MapEvent<K, V> {
      data: {
        readonly key: K;
        readonly value: V;
      };
    }

    /** Map of available `traceable` map event names. */
    type TraceableMapEvents<K, V> = {
      set: (event: MapSetEvent<K, V>) => void;
      delete: (event: MapDeleteEvent<K, V>) => void;
      clear: (event: MapClearEvent<K, V>) => void;
    };
  }
}

export {};
