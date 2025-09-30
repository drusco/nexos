declare global {
  namespace nx {
    /**
     * Event triggered by a proxy operation.
     *
     * @typeParam Data - Event data type.
     */
    interface ProxyEvent<Data = unknown> extends NexoEvent<Proxy, Data> {
      /** Value returned by event listeners. */
      readonly returnValue: unknown;
      /** Always `true` — proxy events are cancelable. */
      readonly cancelable: true;
    }
  }
}

export {};
