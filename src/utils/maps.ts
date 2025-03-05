import type * as nx from "../types/Nexo.js";
import ProxyWrapper from "./ProxyWrapper.js";

const tracables: WeakMap<nx.Traceable, nx.Proxy> = new WeakMap();
const proxies: WeakMap<nx.Traceable, ProxyWrapper> = new WeakMap();

export default { tracables, proxies };
