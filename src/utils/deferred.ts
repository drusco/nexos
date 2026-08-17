import getProxyWrapper from "./getProxyWrapper.js";
import ProxyError from "./ProxyError.js";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

/**
 * Creates a deferred value: a `promise` together with its `resolve` and
 * `reject` functions.
 *
 * @remarks
 * Because the returned `resolve` and `reject` can be invoked at any time —
 * including after asynchronous work completes — this is the primitive that lets
 * proxy traps expose their eventual result as a `Promise` (`event.data.result`)
 * while still returning a synchronous placeholder.
 *
 * @typeParam T - The type of the value the promise resolves to.
 *
 * @example
 * const deferred = createDeferred<string>();
 * deferred.resolve("done");
 * await deferred.promise; // "done"
 */
export function createDeferred<T>(): Deferred<T> {
  let resolve: Deferred<T>["resolve"];
  let reject: Deferred<T>["reject"];

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

export function rejectWith(
  reject: nx.FunctionLike<[() => never]>,
  error: Error,
): never {
  reject(() => {
    throw error;
  });

  if (error instanceof ProxyError) {
    // Retrieve the wrapper for the proxy
    const wrapper = getProxyWrapper(error.target);
    // Emit the error event on the 'nexo' event emitter
    wrapper?.manager?.events?.emit("proxy.error", error);
    // Emit the error event on the wrapper's event emitter
    wrapper?.events?.emit("proxy.error", error);
  }

  throw error;
}

export function resolveWith<R>(
  resolve: nx.FunctionLike<[() => R]>,
  result: R,
): R {
  resolve(() => result);
  return result;
}
