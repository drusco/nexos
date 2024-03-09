import Nexo from "../types/Nexo.js";

const emulators: WeakMap<Nexo.Emulator, Nexo.emulator.data> = new WeakMap();
const tracables: WeakMap<Nexo.traceable, Nexo.Proxy> = new WeakMap();
const proxies: WeakMap<Nexo.Proxy, Nexo.proxy.data> = new WeakMap();

export default { emulators, tracables, proxies };
