import Nexo from "../types/Nexo.js";
import ProxyEvent from "./ProxyEvent.js";

class ProxyHandlerEvent extends ProxyEvent {
  constructor(
    name: Nexo.proxy.handler,
    proxy: Nexo.Proxy,
    data?: Record<string, unknown>,
  ) {
    super(`handler.${name}`, proxy, data);
  }
}

export default ProxyHandlerEvent;
