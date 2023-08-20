import Exotic from "../../types/Exotic.js";
import { map } from "../../utils/index.js";

export default function length(scope: Exotic.Emulator): number {
  const { totalProxies }: Exotic.emulator.data = map.emulators.get(scope);
  return totalProxies;
}
