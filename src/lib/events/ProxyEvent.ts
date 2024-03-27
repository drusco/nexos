import Nexo from "../types/Nexo.js";
import NexoEvent from "./NexoEvent.js";

class ProxyEvent<Target extends Nexo.Proxy, Data> extends NexoEvent<
  Target,
  Data
> {
  constructor(
    name: Nexo.proxy.handler,
    options: Nexo.events.options<Target, Data>,
  ) {
    super(`nx.proxy.${name}`, options);
  }
}

export default ProxyEvent;
