import Exotic from "../types/Exotic.js";
import constants from "./constants.js";

export default function isPayload(value: unknown): value is Exotic.payload {
  if (typeof value !== "string") return false;
  return value.startsWith(constants.NO_BREAK);
}
