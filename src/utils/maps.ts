import type nx from "../types/Nexo.js";
import ProxyWrapper from "./ProxyWrapper.js";

const tracables: WeakMap<nx.traceable, nx.Proxy> = new WeakMap();
const proxies: WeakMap<nx.traceable, ProxyWrapper> = new WeakMap();

export default { tracables, proxies };
