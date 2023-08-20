import Exotic from "../types/Exotic.js";
import { map } from "../utils/index.js";

export default function constructor(
  scope: Exotic.Emulator,
  options?: Exotic.emulator.options,
): void {
  const config = { responseTimeout: 2500 };
  if (options) {
    Object.assign(config, options);
  }
  const data: Exotic.emulator.data = {
    options: config,
    refs: Object.create(null),
    totalProxies: 0, // total item count including revoked items, it only increases
    activeProxies: 0, // items that are not revoked
  };

  map.emulators.set(scope, data);
}
