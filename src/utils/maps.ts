import type * as nx from "../types/Nexo.js";
import ProxyWrapper from "./ProxyWrapper.js";

const proxies: WeakMap<nx.Proxy, ProxyWrapper> = new WeakMap();

export default { proxies };
