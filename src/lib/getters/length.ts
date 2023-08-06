import Exotic from "../../types/Exotic";
import { map } from "../../utils";

export default function length(scope: Exotic.Emulator): number {
  const { totalProxies }: Exotic.emulator.data = map.emulators.get(scope);
  return totalProxies;
}
