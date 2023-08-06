import Exotic from "../../types/Exotic";
import { revokeProxy } from "../../utils";

export default function revoke(
  scope: Exotic.Emulator,
  value: Exotic.traceable,
): boolean {
  return revokeProxy(scope, value);
}
