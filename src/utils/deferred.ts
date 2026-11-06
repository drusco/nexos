import type * as nx from "../types/Nexo.js";

export function createDeferred<T = unknown>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: Error) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

export function rejectWith(
  resolve: nx.FunctionLike<[() => never], void>,
  error: Error,
): never {
  resolve(() => {
    throw error;
  });
  throw error;
}

export function resolveWith<Result = unknown>(
  resolve: nx.FunctionLike<[() => Result]>,
  result: Result,
): Result {
  resolve(() => result);
  return result;
}
