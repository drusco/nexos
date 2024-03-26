import Nexo from "../types/Nexo.js";
import NexoEvent from "./NexoEvent.js";

class ProxyEvent<Target extends Nexo.Proxy, Data> extends NexoEvent<
  Target,
  Data
> {
  constructor(name: Nexo.proxy.handler, target: Target, data?: Data) {
    super(`nx.proxy.${name}`, target, data);
  }
}

export default ProxyEvent;
