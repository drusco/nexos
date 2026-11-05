import Nexo from "../Nexo.js";
import { createDeferred, resolveWith, rejectWith } from "./deferred.js";
import getProxyWrapper from "./getProxyWrapper.js";
import ProxyError from "./ProxyError.js";
import ProxyWrapper from "./ProxyWrapper.js";

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

    it("should settle asynchronously after work completes (deferred settlement)", async () => {
      const deferred = createDeferred<() => string>();

      const work = (async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        deferred.resolve(() => "settled-later");
      })();

      const getResult = await deferred.promise;

      await work;

      expect(getResult()).toBe("settled-later");
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
    it("resolves a deferred with a function that throws an error and throws that error", () => {
      const reject = jest.fn();
      const errorMessage = "foo";
      const error = new Error(errorMessage);

      expect(() => rejectWith(reject, error)).toThrow(errorMessage);
      expect(reject).toHaveBeenCalledTimes(1);

      const [getResult]: [nx.FunctionLike] = reject.mock.lastCall;

      expect(() => getResult()).toThrow(errorMessage);
    });

    it("emits a proxy error to the associated wrapper and manager", () => {
      const nexo = new Nexo();
      const { proxy } = new ProxyWrapper();
      const wrapper = getProxyWrapper(proxy);
      const errorMessage = "something went wrong with the proxy";
      const proxyError = new ProxyError(errorMessage, proxy);

      const wrapperListener = jest.fn();
      const managerListener = jest.fn();
      const wrapperProxyError = jest.fn();
      const managerProxyError = jest.fn();

      wrapper.events.on("error", wrapperListener);
      wrapper.events.on("proxy.error", wrapperProxyError);

      nexo.events.on("error", managerListener);
      nexo.events.on("proxy.error", managerProxyError);

      wrapper.setManager(nexo);

      expect(() => rejectWith(jest.fn(), proxyError)).toThrow(errorMessage);

      expect(wrapperListener).toHaveBeenCalledTimes(1);
      expect(managerListener).toHaveBeenCalledTimes(1);

      expect(wrapperProxyError).toHaveBeenCalledTimes(1);
      expect(managerProxyError).toHaveBeenCalledTimes(1);
    });
  });
});
