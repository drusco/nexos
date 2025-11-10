import ProxyError from "../utils/ProxyError.js";
import ProxyEvent from "../events/ProxyEvent.js";
import apply from "./apply.js";
import getProxy from "../utils/getProxy.js";
import getProxyWrapper from "../utils/getProxyWrapper.js";
import isProxy from "../utils/isProxy.js";

describe("Apply Handler", () => {
  it("creates a new `apply` handler for proxies", () => {
    const proxy = getProxy();
    const resolveProxy = () => proxy;
    const handlerA = apply(resolveProxy);
    const handlerB = apply(resolveProxy);

    expect(handlerA).not.toBe(handlerB);
  });

  it("emits a `proxy.apply` event", async () => {
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);
    const applyListener = jest.fn();

    wrapper.events.on("proxy.apply", applyListener);

    const args = ["foo", "bar"];
    const thisArg = {};
    const handler = apply(() => proxy);
    const result = handler(wrapper.target as nx.FunctionLike, thisArg, args);
    const [event]: [nx.ProxyApplyEvent] = applyListener.mock.lastCall;
    const getResult = await event.data.result;

    expect(applyListener).toHaveBeenCalledTimes(1);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(true);
    expect(event.data.thisArg).toBe(thisArg);
    expect(event.data.args).toStrictEqual(args);
    expect(getResult()).toBe(result);
  });

  it("returns a sandboxed proxy when the original proxy has no target", () => {
    const proxy = getProxy();
    const handler = apply(() => proxy);
    const wrapper = getProxyWrapper(proxy);
    const result = handler(wrapper.target as nx.FunctionLike);

    expect(isProxy(result)).toBe(true);
  });

  it("returns a managed proxy when the original proxy has no target", () => {
    const proxy = getProxy();
    const handler = apply(() => proxy);
    const wrapper = getProxyWrapper(proxy);
    const manager = {
      use: jest.fn(),
      create: jest.fn(getProxy),
      setEventEmitter: jest.fn(),
      removeEventEmitter: jest.fn(),
    };

    wrapper.setManager(manager);

    const result = handler(wrapper.target as nx.FunctionLike);

    expect(isProxy(result)).toBe(true);
    expect(manager.create).toHaveBeenCalledTimes(1);
  });

  it("allows event listeners to override the return value", () => {
    const proxy = getProxy();
    const handler = apply(() => proxy);
    const wrapper = getProxyWrapper(proxy);
    const expectedResult = "foo";

    wrapper.events.on("proxy.apply", (event) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = handler(wrapper.target as nx.FunctionLike);

    expect(result).toBe(expectedResult);
  });

  it("invokes the original function target and returns its result", () => {
    const target = (a: number, b: number): number => a + b;
    const proxy = getProxy(target);
    const wrapper = getProxyWrapper(proxy);
    const handler = apply(() => proxy);

    const result = handler(
      wrapper.target as nx.FunctionLike,
      undefined,
      [4, 1],
    );

    expect(result).toBe(5);
  });

  it("throws a ProxyError if the function target throws and emits error events", async () => {
    const target = () => {
      throw new Error("boom");
    };

    const proxy = getProxy(target);
    const wrapper = getProxyWrapper(proxy);

    const errorListener = jest.fn();
    const applyListener = jest.fn();

    wrapper.events.on("proxy.apply", applyListener);
    wrapper.events.on("proxy.error", errorListener);

    expect(() => proxy()).toThrow(ProxyError);

    const [event]: [nx.ProxyApplyEvent] = applyListener.mock.lastCall;
    const getResult = await event.data.result;

    expect(() => getResult()).toThrow(ProxyError);
    expect(applyListener).toHaveBeenCalledTimes(1);
    expect(errorListener).toHaveBeenCalledTimes(1);
  });
});
