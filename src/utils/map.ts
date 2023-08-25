import Exotic from "../types/Exotic.js";

const emulators: WeakMap<Exotic.Emulator, Exotic.emulator.data> = new WeakMap();
const targets: WeakMap<Exotic.traceable, Exotic.Proxy> = new WeakMap();
const mocks: WeakMap<Exotic.Mock, Exotic.Proxy> = new WeakMap();
const proxies: WeakMap<Exotic.Proxy, Exotic.proxy.data> = new WeakMap();

export default { emulators, mocks, targets, proxies };
