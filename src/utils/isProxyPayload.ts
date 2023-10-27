import Exotic from "../types/Exotic.js";
import constants from "./constants.js";

export default function isProxyPayload(
  value: unknown,
): value is Exotic.proxyPayload {
  if (typeof value !== "string") return false;
  return constants.IS_PROXY_ID_REGEXP.test(value);
}
