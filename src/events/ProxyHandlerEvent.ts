import Nexo from "../types/Nexo.js";
import ProxyEvent from "./ProxyEvent.js";

class ProxyHandlerEvent<Data = unknown> extends ProxyEvent {
  declare readonly data: Data;

  constructor(name: Nexo.proxy.handlerName, proxy: Nexo.Proxy, data?: Data) {
    super(`nx.trap.${name}`, proxy, data);
  }
}

export default ProxyHandlerEvent;
