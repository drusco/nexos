declare global {
  namespace nx {
    /** Map of available proxy related event names. */
    type ProxyEvents = {
      error: (error: Error) => void;
      "proxy.error": (error: ProxyError) => void;
      "proxy.apply": (event: ProxyApplyEvent) => ProxyApplyEvent["returnValue"];
      "proxy.get": (event: ProxyGetEvent) => ProxyGetEvent["returnValue"];
      "proxy.has": (event: ProxyHasEvent) => ProxyHasEvent["returnValue"];
      "proxy.set": (event: ProxySetEvent) => ProxySetEvent["returnValue"];

      "proxy.construct": (
        event: ProxyConstructEvent,
      ) => ProxyConstructEvent["returnValue"];

      "proxy.defineProperty": (
        event: ProxyDefinePropertyEvent,
      ) => ProxyDefinePropertyEvent["returnValue"];

      "proxy.deleteProperty": (
        event: ProxyDeletePropertyEvent,
      ) => ProxyDeletePropertyEvent["returnValue"];

      "proxy.getOwnPropertyDescriptor": (
        event: ProxyGetOwnPropertyDescriptorEvent,
      ) => ProxyGetOwnPropertyDescriptorEvent["returnValue"];

      "proxy.getPrototypeOf": (
        event: ProxyGetPrototypeOfEvent,
      ) => ProxyGetPrototypeOfEvent["returnValue"];

      "proxy.isExtensible": (
        event: ProxyIsExtensibleEvent,
      ) => ProxyIsExtensibleEvent["returnValue"];

      "proxy.ownKeys": (
        event: ProxyOwnKeysEvent,
      ) => ProxyOwnKeysEvent["returnValue"];

      "proxy.preventExtensions": (
        event: ProxyPreventExtensionsEvent,
      ) => ProxyPreventExtensionsEvent["returnValue"];

      "proxy.setPrototypeOf": (
        event: ProxySetPrototypeOfEvent,
      ) => ProxySetPrototypeOfEvent["returnValue"];

      "proxy.rename": (event: ProxyWrapperEvent) => void;
      "proxy.manager": (event: ProxyWrapperEvent) => void;
      "proxy.target": (event: ProxyWrapperEvent) => void;
      "proxy.lock": (event: ProxyWrapperEvent) => void;
      "proxy.unlock": (event: ProxyWrapperEvent) => void;
    };
  }
}

export {};
