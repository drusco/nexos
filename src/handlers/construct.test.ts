import getProxy from "../utils/getProxy.js";
import getProxyWrapper from "../utils/getProxyWrapper.js";
import isProxy from "../utils/isProxy.js";
import ProxyError from "../utils/ProxyError.js";
import ProxyManager from "./__mocks__/ProxyManager.js";
import handler from "./construct.js";

describe("Construct Handler", () => {
  let manager: nx.ProxyManager;

  beforeEach(() => {
    manager = ProxyManager();
  });

  it("creates a new `construct` handler for proxies", () => {
    const proxy = getProxy();
    const resolveProxy = () => proxy;

    const construct_1 = handler(resolveProxy);
    const construct_2 = handler(resolveProxy);

    expect(construct_1).not.toBe(construct_2);
  });

  it("emits a 'proxy.construct' event", async () => {
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);
    const construct = handler(() => proxy);
    const listener = jest.fn();

    wrapper.events.on("proxy.construct", listener);
    wrapper.setManager(manager);

    const args = ["foo", "bar"];
    const result = construct(proxy, args);

    const [event]: [nx.ProxyConstructEvent] = listener.mock.lastCall;
    const getResult = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(manager.events.emit).toHaveBeenCalledWith("proxy.construct", event);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(true);
    expect(event.data.args).toStrictEqual(args);
    expect(getResult()).toBe(result);
  });

  it("returns a sandboxed proxy by default", () => {
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);
    const construct = handler(() => proxy);
    const result = construct(wrapper.target as nx.FunctionLike);

    expect(isProxy(result)).toBe(true);
    expect(manager.create).not.toHaveBeenCalled();
  });

  it("returns a managed proxy when a proxy manager is present", () => {
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);
    const construct = handler(() => proxy);

    wrapper.setManager(manager);
    const result = construct(wrapper.target as nx.FunctionLike);

    expect(isProxy(result)).toBe(true);
    expect(manager.create).toHaveBeenCalledTimes(1);
  });

  it("constructs an instance using the target constructor", () => {
    class MyClass {}
    const proxy = getProxy(MyClass);
    const wrapper = getProxyWrapper(proxy);
    const construct = handler(() => proxy);
    const result = construct(wrapper.target as nx.FunctionLike);

    expect(result).toBeInstanceOf(MyClass);
  });

  it("allows event listeners to override the returned instance", () => {
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);
    const construct = handler(() => proxy);
    const expectedResult = {};

    wrapper.events.on("proxy.construct", (event) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = construct(wrapper.target as nx.FunctionLike);

    expect(result).toBe(expectedResult);
  });

  it("throws ProxyError if the overridden result is not an object", () => {
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);
    const construct = handler(() => proxy);

    wrapper.events.on("proxy.construct", (event) => {
      event.preventDefault();
      return "invalid" as null;
    });

    expect(() => construct(wrapper.target as nx.FunctionLike)).toThrow(
      ProxyError,
    );
  });

  it("throws ProxyError if the original constructor throws", () => {
    class ExplodingClass {
      constructor() {
        throw new Error("boom");
      }
    }
    const proxy = getProxy(ExplodingClass);
    const wrapper = getProxyWrapper(proxy);
    const construct = handler(() => proxy);

    expect(() => construct(wrapper.target as nx.FunctionLike)).toThrow(
      ProxyError,
    );
  });
});
