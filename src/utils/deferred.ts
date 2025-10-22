import getProxyWrapper from "./getProxyWrapper.js";
import ProxyError from "./ProxyError.js";

export function createDeferred<T = unknown>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: Error) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

export function rejectWith(resolve: nx.FunctionLike, error: Error): never {
  resolve(() => {
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

export function resolveWith<Result = unknown>(
  resolve: nx.FunctionLike<[() => Result]>,
  result: Result,
): Result {
  resolve(() => result);
  return result;
}
