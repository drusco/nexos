import isProxy from "../utils/isProxy.js";
import ProxyError from "../utils/ProxyError.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";
import ProxyManager from "./__mocks__/ProxyManager.js";
import handler from "./construct.js";

describe("Construct Handler", () => {
  let manager: nx.ProxyManager;

  beforeEach(() => {
    manager = ProxyManager();
  });

  it("creates a new `construct` handler for proxies", () => {
    const wrapper = new ProxyWrapper();
    const resolveProxy = () => wrapper.proxy;

    const construct_1 = handler(resolveProxy);
    const construct_2 = handler(resolveProxy);

    expect(construct_1).not.toBe(construct_2);
  });

  it("emits a 'proxy.construct' event", async () => {
    const wrapper = new ProxyWrapper();
    const construct = handler(() => wrapper.proxy);
    const listener = jest.fn();

    wrapper.events.on("proxy.construct", listener);
    wrapper.setManager(manager);

    const args = ["foo", "bar"];
    const result = construct(wrapper.proxy as nx.FunctionLike, args);

    const [event]: [nx.ProxyConstructEvent] = listener.mock.lastCall;
    const getResult = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(manager.events.emit).toHaveBeenCalledWith("proxy.construct", event);
    expect(event.target).toBe(wrapper.proxy);
    expect(event.cancelable).toBe(true);
    expect(event.data.args).toStrictEqual(args);
    expect(getResult()).toBe(result);
  });

  it("returns a sandboxed proxy by default", () => {
    const wrapper = new ProxyWrapper();
    const construct = handler(() => wrapper.proxy);
    const result = construct(wrapper.target as nx.FunctionLike);

    expect(isProxy(result)).toBe(true);
    expect(manager.create).not.toHaveBeenCalled();
  });

  it("returns a managed proxy when a proxy manager is present", () => {
    const wrapper = new ProxyWrapper();
    const construct = handler(() => wrapper.proxy);

    wrapper.setManager(manager);
    const result = construct(wrapper.target as nx.FunctionLike);

    expect(isProxy(result)).toBe(true);
    expect(manager.create).toHaveBeenCalledTimes(1);
  });

  it("constructs an instance using the target constructor", () => {
    class MyClass {}
    const wrapper = new ProxyWrapper(MyClass);
    const construct = handler(() => wrapper.proxy);
    const result = construct(wrapper.target as object as nx.FunctionLike);

    expect(result).toBeInstanceOf(MyClass);
  });

  it("allows event listeners to override the returned instance", () => {
    const wrapper = new ProxyWrapper();
    const construct = handler(() => wrapper.proxy);
    const expectedResult = {};

    wrapper.events.on("proxy.construct", (event) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = construct(wrapper.target as nx.FunctionLike);

    expect(result).toBe(expectedResult);
  });

  it("throws ProxyError if the overridden result is not an object", () => {
    const wrapper = new ProxyWrapper();
    const construct = handler(() => wrapper.proxy);

    wrapper.setManager(manager);

    const errorListener = jest.fn();
    const listener = jest.fn((event) => {
      event.preventDefault();
      return "invalid" as null;
    });

    wrapper.events.on("proxy.construct", listener);
    wrapper.events.on("proxy.error", errorListener);

    expect(() => construct(wrapper.target as nx.FunctionLike)).toThrow(
      ProxyError,
    );

    const [event]: [nx.ProxyConstructEvent] = listener.mock.lastCall;
    const [error]: [nx.ProxyError] = errorListener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(errorListener).toHaveBeenCalledTimes(1);
    expect(manager.events.emit).toHaveBeenCalledWith("proxy.construct", event);
    expect(manager.events.emit).toHaveBeenCalledWith("proxy.error", error);
  });

  it("throws ProxyError if the original constructor throws", () => {
    class ExplodingClass {
      constructor() {
        throw new Error("boom");
      }
    }
    const wrapper = new ProxyWrapper(ExplodingClass);
    const construct = handler(() => wrapper.proxy);

    expect(() =>
      construct(wrapper.target as unknown as nx.FunctionLike),
    ).toThrow(ProxyError);
  });
});
