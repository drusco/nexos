import Exotic from "../../types/Exotic.js";
import { map } from "../../utils/index.js";

export default function active(scope: Exotic.Emulator): number {
  const { activeProxies }: Exotic.emulator.data = map.emulators.get(scope);
  return activeProxies;
}
