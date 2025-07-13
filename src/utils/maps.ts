import type * as nx from "../types/Nexo.js";
import ProxyWrapper from "./ProxyWrapper.js";

const proxies: WeakMap<nx.Proxy, Map<symbol, ProxyWrapper>> = new WeakMap();
const tracables: WeakMap<nx.Traceable, Map<symbol, nx.Proxy>> = new WeakMap();

export default { tracables, proxies };
