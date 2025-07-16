import type * as nx from "../types/Nexo.js";

const proxies: WeakMap<nx.Proxy, nx.ProxyWrapper> = new WeakMap();

export default { proxies };
