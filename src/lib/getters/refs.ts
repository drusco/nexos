import Exotic from "../../types/Exotic";
import { map } from "../../utils";

export default function refs(scope: Exotic.Emulator): Exotic.key[] {
  const { refs }: Exotic.emulator.data = map.emulators.get(scope);
  return Reflect.ownKeys(refs);
}
