import ProxyPipeline from "./ProxyPipeline.js";
import lockMiddleware from "../middlewares/lockMiddleware.js";

/**
 * The core pipeline: always-on invariants applied to every proxy.
 *
 * @remarks
 * Holds the core middlewares (currently the lock guard) that must run before any
 * manager or wrapper middleware. This pipeline is the shared root parent of every
 * manager and wrapper pipeline.
 */
const corePipeline = new ProxyPipeline<
  nx.ProxyWrapper<object, nx.ProxyEvents>
>();

corePipeline.use("lock", lockMiddleware, { protected: true });

export default corePipeline;
