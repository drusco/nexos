import ProxyError from "../utils/ProxyError.js";

/**
 * The core lock guard middleware.
 *
 * @remarks
 * Rejects any trap invocation on a locked proxy by emitting a `proxy.error` event
 * and throwing a {@link ProxyError}. It is registered on the shared core pipeline
 * (`src/utils/corePipeline.ts`) and therefore runs before every manager and
 * wrapper middleware.
 */
const lockMiddleware = (
  { context }: { context: nx.ProxyWrapper<object, nx.ProxyEvents> },
  next: () => void,
): void => {
  if (!context.locked) {
    return next();
  }

  const error = new ProxyError(
    "The proxy is locked and cannot be used.",
    context.proxy,
  );

  context.events?.emit("proxy.error", error);
  throw error;
};

export default lockMiddleware;
