import Exotic from "../types/Exotic";

const emulators = new WeakMap<Exotic.Emulator, Exotic.emulator.data>();
const dummies = new WeakMap<Exotic.FunctionLike, Exotic.Proxy>();
const targets = new WeakMap<Exotic.traceable, Exotic.Proxy>();
const proxies = new WeakMap<Exotic.Proxy, Exotic.emulator.proxyData>();

export default { emulators, dummies, targets, proxies };
