declare global {
  namespace nx {
    /** Map of available {@link nx.ProxyManager} and {@link nx.ProxyWrapper} event names. */
    type ProxyEvents = {
      error: { args: [Error] };
      "proxy.error": { args: [ProxyError] };
      "proxy.apply": {
        args: [ProxyApplyEvent];
        result: ProxyApplyEvent["returnValue"];
      };
      "proxy.construct": {
        args: [ProxyConstructEvent];
        result: ProxyConstructEvent["returnValue"];
      };
      "proxy.defineProperty": {
        args: [ProxyDefinePropertyEvent];
        result: ProxyDefinePropertyEvent["returnValue"];
      };
      "proxy.deleteProperty": {
        args: [ProxyDeletePropertyEvent];
        result: ProxyDeletePropertyEvent["returnValue"];
      };
      "proxy.get": {
        args: [ProxyGetEvent];
        result: ProxyGetEvent["returnValue"];
      };
      "proxy.getOwnPropertyDescriptor": {
        args: [ProxyGetOwnPropertyDescriptorEvent];
        result: ProxyGetOwnPropertyDescriptorEvent["returnValue"];
      };
      "proxy.getPrototypeOf": {
        args: [ProxyGetPrototypeOfEvent];
        result: ProxyGetPrototypeOfEvent["returnValue"];
      };
      "proxy.has": {
        args: [ProxyHasEvent];
        result: ProxyHasEvent["returnValue"];
      };
      "proxy.isExtensible": {
        args: [ProxyIsExtensibleEvent];
        result: ProxyIsExtensibleEvent["returnValue"];
      };
      "proxy.ownKeys": {
        args: [ProxyOwnKeysEvent];
        result: ProxyOwnKeysEvent["returnValue"];
      };
      "proxy.preventExtensions": {
        args: [ProxyPreventExtensionsEvent];
        result: ProxyPreventExtensionsEvent["returnValue"];
      };
      "proxy.set": {
        args: [ProxySetEvent];
        result: ProxySetEvent["returnValue"];
      };
      "proxy.setPrototypeOf": {
        args: [ProxySetPrototypeOfEvent];
        result: ProxySetPrototypeOfEvent["returnValue"];
      };
    };
  }
}

export {};
