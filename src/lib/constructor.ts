import Exotic from "../types/Exotic";
import { map } from "../utils";

export default function constructor(
  scope: Exotic.Emulator,
  options: Exotic.emulator.options,
): void {
  const data: Exotic.emulator.data = {
    options,
    refs: Object.create(null),
    totalProxies: 0, // total item count including revoked items, it only increases
    activeProxies: 0, // items that are not revoked
    firstProxy: undefined,
    lastProxy: undefined,
  };

  map.emulators.set(scope, data);
}
