import { IS_UUID_PAYLOAD } from "../lib/constants.js";

export default function isUUIDPayload(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return IS_UUID_PAYLOAD.test(value);
}
