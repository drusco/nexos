import type nx from "./types/Nexo.js";
import EventEmitter from "events";
import handlers from "../utils/handlers/index.js";
import map from "./maps.js";

class NexoProxy extends EventEmitter {
  static create(): {
    proxy: nx.Proxy;
    revoke: () => void;
    wrapper: nx.Wrapper;
  } {
    const target = () => {};
    const wrapper = Object.setPrototypeOf(target, NexoProxy.prototype);
    const { proxy, revoke } = Proxy.revocable(wrapper, handlers);

    return {
      proxy,
      wrapper,
      revoke,
    };
  }

  private get data() {
    const proxy = map.tracables.get(this);
    return map.proxies.get(proxy);
  }

  get id(): string | void {
    return this.data?.id;
  }

  get target(): nx.traceable | void {
    return this.data?.target;
  }
}

export default NexoProxy;
