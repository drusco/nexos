import constants from "./constants.js";

export default function isProxyPayload(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return constants.IS_PROXY_ID_REGEXP.test(value);
}
