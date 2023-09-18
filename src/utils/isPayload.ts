import constants from "./constants.js";

export default function isPayload(value: string): boolean {
  return constants.IS_PROXY_ID_REGEXP.test(value);
}
