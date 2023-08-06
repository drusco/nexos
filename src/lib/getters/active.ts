import Exotic from "../../types/Exotic";
import { map } from "../../utils";

export default function active(scope: Exotic.Emulator): number {
  const { activeProxies }: Exotic.emulator.data = map.emulators.get(scope);
  return activeProxies;
}
