declare global {
  namespace nx {
    /** Fired when property metadata is requested. */
    interface ProxyGetOwnPropertyDescriptorEvent extends Event<Proxy> {
      readonly returnValue: void | PropertyDescriptor;
      readonly data: {
        /** Target object. */
        readonly target: object;
        /** Property key being inspected. */
        readonly property: ObjectKey;
        /** Descriptor of the property. */
        readonly result: Promise<FunctionLike<[], PropertyDescriptor>>;
      };
    }
  }
}

export {};
