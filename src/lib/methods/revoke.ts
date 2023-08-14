import Exotic from "../../types/Exotic";
import { revokeProxy } from "../../utils";

export default function revoke(value: Exotic.traceable): boolean {
  return revokeProxy(value);
}
