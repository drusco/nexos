import Exotic from "../types/Exotic.js";
import constants from "./constants.js";
import isPayload from "./isPayload.js";
import map from "./map.js";

export default function findProxyByLink(
  scope: Exotic.Emulator,
  link: string,
): void | Exotic.Proxy {
  const { links } = map.emulators.get(scope);
  const key = isPayload(link) ? link : constants.NO_BREAK + link;
  return links[key];
}
