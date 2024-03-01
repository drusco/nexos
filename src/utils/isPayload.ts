import constants from "./constants.js";

export default function isPayload(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return value.startsWith(constants.NO_BREAK);
}
