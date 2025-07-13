import type * as nx from "../types/Nexo.js";
import map from "./maps.js";
import isProxy from "./isProxy.js";
import isTraceable from "./isTraceable.js";

/**
 * Attempts to retrieve the associated {@link nx.Proxy | Proxy} for a given value.
 *
 * - If the value is a known proxy, it is returned directly.
 * - If the value is "traceable", the system attempts to look up
 *   a proxy it may be linked to.
 *
 * This function is useful for introspection or reverse lookup
 * in cases where a proxy reference is needed but not directly accessible.
 *
 * @param value - The value to resolve to a proxy.
 * @param nexoId - The nexo instance symbol owning the context.
 * @returns The associated {@link nx.Proxy | Proxy} instance, or `undefined` if none is found.
 */
const findProxy = (value: unknown, nexoId: symbol): void | nx.Proxy => {
  if (isProxy(value)) return value;
  if (isTraceable(value)) {
    const proxyMap = map.tracables.get(value);
    return proxyMap?.get(nexoId);
  }
};

export default findProxy;
