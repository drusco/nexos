import Exotic from "../../types/Exotic";
import { map } from "../../utils";

export default function revoked(scope: Exotic.Emulator): number {
  const { activeProxies, totalProxies }: Exotic.emulator.data =
    map.emulators.get(scope);
  return totalProxies - activeProxies;
}
