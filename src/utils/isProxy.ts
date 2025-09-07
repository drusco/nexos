import * as nx from "../types/Nexo.js";
import { getProxyMap } from "./constants.js";

/**
 * Determines whether the given value is a registered {@link nx.Proxy | Proxy} instance.
 *
 * This function checks if the value exists in the internal proxy map,
 * meaning it was previously registered as a proxy via the system.
 *
 * Acts as a type guard for narrowing `unknown` to {@link nx.Proxy | Proxy}.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a known {@link nx.Proxy | Proxy}, otherwise `false`.
 */
export default function isProxy(value: unknown): value is nx.Proxy {
  return getProxyMap().has(value as nx.Proxy);
}
