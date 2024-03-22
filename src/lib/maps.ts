import Nexo from "./types/Nexo.js";

const tracables: WeakMap<Nexo.traceable, Nexo.Proxy> = new WeakMap();
const proxies: WeakMap<Nexo.Proxy, Nexo.proxy.data> = new WeakMap();

export default { tracables, proxies };
