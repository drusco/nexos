import Exotic from "../types/Exotic";
import { map } from "../utils";

export default function constructor(
  scope: Exotic.Emulator,
  options?: Exotic.emulator.options,
): void {
  const config = { getTimeout: 3000 };
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
