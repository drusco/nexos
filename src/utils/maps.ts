import type * as nx from "../types/Nexo.js";
import ProxyWrapper from "./ProxyWrapper.js";

const proxies: WeakMap<nx.Proxy, WeakMap<symbol, ProxyWrapper>> = new WeakMap();
const tracables: WeakMap<
  nx.Traceable,
  WeakMap<symbol, nx.Proxy>
> = new WeakMap();

export default { tracables, proxies };
