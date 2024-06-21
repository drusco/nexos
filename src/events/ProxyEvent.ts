import type nx from "../types/Nexo.js";
import NexoEvent from "./NexoEvent.js";

class ProxyEvent<Target extends nx.Proxy, Data> extends NexoEvent<
  Target,
  Data
> {
  constructor(
    name: nx.proxy.handler,
    options: nx.events.options<Target, Data>,
  ) {
    super(`nx.proxy.${name}`, options);
  }
}

export default ProxyEvent;
