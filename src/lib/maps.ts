import type nx from "./types/Nexo.js";

const tracables: WeakMap<nx.traceable, nx.Proxy> = new WeakMap();
const proxies: WeakMap<nx.Proxy, nx.proxy.data> = new WeakMap();

export default { tracables, proxies };
