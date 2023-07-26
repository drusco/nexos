import Exotic from "../types/Exotic.js";

const emulators = new WeakMap<Exotic.Emulator, Exotic.emulator.private>();
const dummies = new WeakMap<Exotic.FunctionLike, Exotic.Proxy>();
const targets = new WeakMap<Exotic.Traceable, Exotic.Proxy>();
const proxies = new WeakMap<Exotic.Proxy, Exotic.emulator.item>();

export default { emulators, dummies, targets, proxies };
