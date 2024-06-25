import type nx from "../types/Nexo.js";
import NexoEvent from "./NexoEvent.js";

class ProxyEvent<Data = unknown, Return = unknown> extends NexoEvent<
  nx.Proxy,
  Data,
  Return
> {
  constructor(
    name: nx.proxy.handler,
    options: nx.events.options<nx.Proxy, Data>,
  ) {
    super(`nx.proxy.${name}`, options);
  }
}

export default ProxyEvent;
