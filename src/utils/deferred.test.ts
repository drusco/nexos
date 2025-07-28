import type * as nx from "../types/Nexo.js";
import { createDeferred, resolveWith, rejectWith } from "./deferred.js";

describe("deferred", () => {
  describe("createDeferred", () => {
    it("should return a promise with resolve and reject methods", () => {
      const deferred = createDeferred();

      expect(deferred).toHaveProperty("promise");
      expect(deferred.promise).toBeInstanceOf(Promise);
      expect(typeof deferred.resolve).toBe("function");
      expect(typeof deferred.reject).toBe("function");
    });

    it("should resolve the promise with a given value", async () => {
      const deferred = createDeferred<boolean>();

      deferred.resolve(true);

      await expect(deferred.promise).resolves.toBe(true);
    });

    it("should reject the promise with an error", async () => {
      const deferred = createDeferred();

      const error = new Error("expected failure");
      deferred.reject(error);

      await expect(deferred.promise).rejects.toThrow("expected failure");
    });
  });

  describe("resolveWith", () => {
    it("resolves a deferred with a function that returns a custom value and returns that value", () => {
      const resolve = jest.fn();
      const customValue = "anyValue";
      const result = resolveWith(resolve, customValue);
      const [getResult]: [nx.FunctionLike<[], typeof customValue>] =
        resolve.mock.lastCall;

      expect(result).toBe(customValue);
      expect(resolve).toHaveBeenCalledTimes(1);
      expect(getResult()).toBe(customValue);
    });
  });

  describe("rejectWith", () => {
    it("rejects a deferred with a function that throws an error and throws that error", () => {
      const reject = jest.fn();
      const errorMessage = "foo";
      const error = new Error(errorMessage);

      expect(() => rejectWith(reject, error)).toThrow(errorMessage);

      const [getResult]: [nx.FunctionLike<[], never>] = reject.mock.lastCall;

      expect(reject).toHaveBeenCalledTimes(1);
      expect(() => getResult()).toThrow(errorMessage);
    });
  });
});
