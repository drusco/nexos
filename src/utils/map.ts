import Exotic from "../types/Exotic";

const emulators = new WeakMap<Exotic.Emulator, Exotic.emulator.data>();
const mocks = new WeakMap<Exotic.Mock, Exotic.Proxy>();
const targets = new WeakMap<Exotic.traceable, Exotic.Proxy>();
const proxies = new WeakMap<Exotic.Proxy, Exotic.proxy.data>();

export default { emulators, mocks, targets, proxies };
