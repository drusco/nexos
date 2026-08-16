import Event from "./Event.js";
import isProxy from "../utils/isProxy.js";

type ProxyEventSuffix =
  | keyof ProxyHandler<object>
  | "lock"
  | "unlock"
  | "rename"
  | "manager"
  | "target";

/**
 * Represents an event triggered by a proxy.
 */
class ProxyEvent<D> extends Event<object, D> {
  /**
   * Creates an instance of the `ProxyEvent`.
   * This constructor initializes the event with the name prefixed by `proxy.`
   *
   * @param name - Name of the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy#handler_functions | built-in handler}.
   * @param options - Options to configure the event.
   * @param options.data - The data associated with the event.
   * @param options.target - The proxy of the event.
   */
  constructor(
    name: ProxyEventSuffix,
    options?: {
      data?: D;
      target: object;
      cancelable?: boolean;
    },
  ) {
    if (!isProxy(options?.target)) {
      throw TypeError("options.target is not a valid proxy.");
    }
    super(`proxy.${name}`, { cancelable: true, ...options });
  }
}

export default ProxyEvent;
