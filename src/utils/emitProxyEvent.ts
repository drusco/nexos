/**
 * Fans a proxy event out to both the manager and wrapper emitters.
 *
 * @remarks
 * Every proxy operation is observed by two emitters: the manager (for global
 * listeners) and the wrapper (for per-proxy listeners). This helper centralizes
 * that fan-out so trap handlers don't duplicate the two emit calls.
 *
 * @param wrapper - The proxy wrapper the event belongs to.
 * @param event - The event to dispatch (its `name` selects the event channel).
 */
export default function emitProxyEvent(
  wrapper: nx.ProxyWrapper,
  event: nx.Event,
): void {
  wrapper?.manager?.events?.emit(event.name, event);
  wrapper?.events?.emit(event.name, event);
}
