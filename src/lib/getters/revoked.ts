import Exotic from "../../types/Exotic.js";
import { map } from "../../utils/index.js";

export default function revoked(scope: Exotic.Emulator): number {
  const { activeProxies, totalProxies }: Exotic.emulator.data =
    map.emulators.get(scope);
  return totalProxies - activeProxies;
}
