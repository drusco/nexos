import Exotic from "../types/Exotic.js";
import { map } from "../utils/index.js";

export default function constructor(
  scope: Exotic.Emulator,
  options?: Exotic.emulator.options,
): void {
  // set config defaults
  const config = { traceErrors: false };
  if (options) {
    Object.assign(config, options);
  }
  const data: Exotic.emulator.data = {
    options: config,
    refs: Object.create(null),
    counter: 0,
    proxySet: new Set(),
  };

  map.emulators.set(scope, data);
}
