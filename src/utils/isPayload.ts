import constants from "./constants.js";

export default function isPayload(value: any): boolean {
  if (typeof value !== "string") return false;
  if (!constants.IS_PROXY_ID_REGEXP.test(value)) return false;
  return true;
}
