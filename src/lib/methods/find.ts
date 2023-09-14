import Exotic from "../../types/Exotic.js";
import { findProxy, findProxyById } from "../../utils/index.js";

export default function find(
  scope: Exotic.Emulator,
  value: string | Exotic.traceable,
): undefined | Exotic.Proxy {
  if (typeof value === "string") {
    return findProxyById(scope, value);
  }
  return findProxy(value);
}
