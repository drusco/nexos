import Exotic from "../types/Exotic.js";
import { map, constants } from "../utils/index.js";

export default function constructor(
  scope: Exotic.Emulator,
  options: Exotic.emulator.options = {},
): void {
  // set config defaults
  const config: Exotic.emulator.options = constants.CONFIG;
  Object.assign(config, options);
  Error.stackTraceLimit = config.stackTraceLimit;

  const data: Exotic.emulator.data = {
    options: config,
    links: Object.create(null),
    counter: 0,
    proxySet: new Set(),
  };

  map.emulators.set(scope, data);
}
