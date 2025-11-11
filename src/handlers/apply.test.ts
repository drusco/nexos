import ProxyError from "../utils/ProxyError.js";
import ProxyEvent from "../events/ProxyEvent.js";
import handler from "./apply.js";
import getProxy from "../utils/getProxy.js";
import getProxyWrapper from "../utils/getProxyWrapper.js";
import isProxy from "../utils/isProxy.js";
import ProxyManager from "./__mocks__/ProxyManager.js";

describe("Apply Handler", () => {
  let manager: nx.ProxyManager;

  beforeEach(() => {
    manager = ProxyManager();
  });

  it("creates a new `apply` handler for proxies", () => {
    const proxy = getProxy();
    const resolveProxy = () => proxy;

    const apply_1 = handler(resolveProxy);
    const apply_2 = handler(resolveProxy);

    expect(apply_1).not.toBe(apply_2);
  });

  it("emits a `proxy.apply` event", async () => {
    const proxy = getProxy();
    const apply = handler(() => proxy);
    const wrapper = getProxyWrapper(proxy);
    const listener = jest.fn();

    wrapper.setManager(manager);
    wrapper.events.on("proxy.apply", listener);

    const args = ["foo", "bar"];
    const thisArg = {};

    const result = apply(wrapper.target as nx.FunctionLike, thisArg, args);
    const [event]: [nx.ProxyApplyEvent] = listener.mock.lastCall;
    const getResult = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(manager.events.emit).toHaveBeenCalledWith("proxy.apply", event);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(true);
    expect(event.data.thisArg).toBe(thisArg);
    expect(event.data.args).toStrictEqual(args);
    expect(getResult()).toBe(result);
  });

  it("returns a sandboxed proxy by default", () => {
    const proxy = getProxy();
    const apply = handler(() => proxy);
    const wrapper = getProxyWrapper(proxy);
    const result = apply(wrapper.target as nx.FunctionLike);

    expect(isProxy(result)).toBe(true);
    expect(manager.create).not.toHaveBeenCalled();
  });

  it("returns a managed proxy when a proxy manager is present", () => {
    const proxy = getProxy();
    const apply = handler(() => proxy);
    const wrapper = getProxyWrapper(proxy);

    wrapper.setManager(manager);

    const result = apply(wrapper.target as nx.FunctionLike);

    expect(isProxy(result)).toBe(true);
    expect(manager.create).toHaveBeenCalledTimes(1);
  });

  it("allows event listeners to override the return value", () => {
    const proxy = getProxy();
    const apply = handler(() => proxy);
    const wrapper = getProxyWrapper(proxy);
    const expectedResult = "foo";

    wrapper.events.on("proxy.apply", (event) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = apply(wrapper.target as nx.FunctionLike);

    expect(result).toBe(expectedResult);
  });

  it("invokes the original function target and returns its result", () => {
    const target = (a: number, b: number): number => a + b;
    const proxy = getProxy(target);
    const wrapper = getProxyWrapper(proxy);
    const apply = handler(() => proxy);

    const result = apply(wrapper.target as nx.FunctionLike, undefined, [4, 1]);

    expect(result).toBe(5);
  });

  it("throws a ProxyError if the function target throws and emits error events", async () => {
    const target = () => {
      throw new Error("boom");
    };

    const proxy = getProxy(target);
    const wrapper = getProxyWrapper(proxy);
    wrapper.setManager(manager);

    const errorListener = jest.fn();
    const applyListener = jest.fn();

    wrapper.events.on("proxy.apply", applyListener);
    wrapper.events.on("proxy.error", errorListener);

    expect(() => proxy()).toThrow(ProxyError);

    const [event]: [nx.ProxyApplyEvent] = applyListener.mock.lastCall;
    const [error]: [nx.ProxyError] = errorListener.mock.lastCall;

    const getResult = await event.data.result;

    expect(() => getResult()).toThrow(ProxyError);
    expect(applyListener).toHaveBeenCalledTimes(1);
    expect(errorListener).toHaveBeenCalledTimes(1);
    expect(manager.events.emit).toHaveBeenCalledTimes(2);
    expect(manager.events.emit).toHaveBeenCalledWith("proxy.apply", event);
    expect(manager.events.emit).toHaveBeenCalledWith("proxy.error", error);
  });
});
