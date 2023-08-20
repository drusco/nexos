import Exotic from "../../types/Exotic.js";
import { revokeProxy } from "../../utils/index.js";

export default function revoke(value: Exotic.traceable): boolean {
  return revokeProxy(value);
}
