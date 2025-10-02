import Event from "./Event.js";
import isProxy from "../utils/isProxy.js";

type HandlerNames =
  | "get"
  | "has"
  | "deleteProperty"
  | "getOwnPropertyDescriptor"
  | "set"
  | "defineProperty"
  | "apply"
  | "construct"
  | "getPrototypeOf"
  | "isExtensible"
  | "ownKeys"
  | "preventExtensions"
  | "setPrototypeOf";

/**
 * Represents an event triggered by a proxy.
 */
class ProxyEvent<Data = unknown>
  extends Event<nx.Proxy, Data>
  implements nx.ProxyEvent<Data>
{
  declare readonly cancelable: true;

  /**
   * Creates an instance of the `ProxyEvent`.
   * This constructor initializes the event with the name prefixed by `proxy.`
   *
   * @param name - Name of the built-in {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy#handler_functions | handler function}.
   * @param options - Options to configure the event.
   * @param options.data - The data associated with the event.
   * @param options.target - The proxy of the event.
   *
   * @example
   * const proxyEvent = new ProxyEvent('get', { target: proxy, data: "example" });
   */
  constructor(
    name: HandlerNames,
    options?: {
      data?: Data;
      target: nx.Proxy;
    },
  ) {
    if (!isProxy(options?.target)) {
      throw TypeError("options.target is not a valid proxy.");
    }
    super(`proxy.${name}`, { ...options, cancelable: true });
  }
}

export default ProxyEvent;
