import { IS_PAYLOAD } from "../lib/constants.js";

export default function isProxyPayload(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return IS_PAYLOAD.test(value);
}
