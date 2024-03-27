import NexoTS from "./types/Nexo.js";
import { getProxy } from "../utils/index.js";
import map from "./maps.js";
import NexoMap from "./NexoMap.js";
import EventEmitter from "events";
import NexoError from "./errors/NexoError.js";

class Nexo extends EventEmitter {
  readonly entries: NexoMap<NexoTS.Proxy>;

  constructor() {
    super();
    this.entries = new NexoMap();
  }

  static getId(proxy: NexoTS.Proxy): string {
    const data = map.proxies.get(proxy);
    return data.id;
  }

  static getTarget(proxy: NexoTS.Proxy): void | NexoTS.traceable {
    const { target } = map.proxies.get(proxy);

    if (target) {
      return target.deref();
    }
  }

  static wrap(proxy: NexoTS.Proxy): NexoTS.Wrapper {
    const { wrapper } = map.proxies.get(proxy);
    return wrapper.deref();
  }

  use(id: string, target?: NexoTS.traceable | void): NexoTS.Proxy {
    if (this.entries.has(id)) {
      if (target) {
        throw new NexoError(
          `${this.constructor.name}: [Proxy ${id}] is already declared`,
          this,
        );
      }

      // returns an existing proxy by its id
      return this.entries.get(id).deref();
    }

    // creates a new proxy using a custom name
    const proxy = getProxy(this, target, id);
    this.entries.set(id, new WeakRef(proxy));

    return proxy;
  }

  proxy(target?: NexoTS.traceable | void): NexoTS.Proxy {
    if (!target) {
      return getProxy(this);
    }

    return getProxy(this, target);
  }
}

export default Nexo;
