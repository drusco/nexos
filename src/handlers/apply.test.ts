import ProxyError from "../utils/ProxyError.js";
import ProxyEvent from "../events/ProxyEvent.js";
import isProxy from "../utils/isProxy.js";
import ProxyManager from "./__mocks__/ProxyManager.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

describe("Apply Handler", () => {
  let manager: nx.ProxyManager;

  beforeEach(() => {
    manager = ProxyManager();
  });

  it("emits a `proxy.apply` event", async () => {
    const wrapper = new ProxyWrapper();
    const listener = jest.fn();

    wrapper.setManager(manager);
    wrapper.events.on("proxy.apply", listener);

    const args = ["foo", "bar"];
    const thisArg = {};

    const result = Reflect.apply(wrapper.proxy, thisArg, args);
    const [event]: [nx.ProxyApplyEvent] = listener.mock.lastCall;
    const getResult = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(manager.events.emit).toHaveBeenCalledWith("proxy.apply", event);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.target).toBe(wrapper.proxy);
    expect(event.cancelable).toBe(true);
    expect(event.data.thisArg).toBe(thisArg);
    expect(event.data.args).toStrictEqual(args);
    expect(getResult()).toBe(result);
  });

  it("returns a sandboxed proxy by default", () => {
    const wrapper = new ProxyWrapper();
    const result = Reflect.apply(wrapper.proxy, null, []);

    expect(isProxy(result)).toBe(true);
    expect(manager.create).not.toHaveBeenCalled();
  });

  it("returns a managed proxy when a proxy manager is present", () => {
    const wrapper = new ProxyWrapper();
    wrapper.setManager(manager);

    const result = Reflect.apply(wrapper.proxy, null, []);

    expect(isProxy(result)).toBe(true);
    expect(manager.create).toHaveBeenCalledTimes(1);
  });

  it("allows event listeners to override the return value", () => {
    const wrapper = new ProxyWrapper();
    const expectedResult = "foo";

    wrapper.events.on("proxy.apply", (event) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = Reflect.apply(wrapper.proxy, null, []);

    expect(result).toBe(expectedResult);
  });

  it("invokes the original function target and returns its result", () => {
    const target = (a: number, b: number): number => a + b;
    const wrapper = new ProxyWrapper(target);

    const result = Reflect.apply(wrapper.proxy, null, [4, 1]);

    expect(result).toBe(5);
  });

  it("throws a ProxyError if the function target throws and emits error events", async () => {
    const target = () => {
      throw new Error("boom");
    };

    const wrapper = new ProxyWrapper(target);
    wrapper.setManager(manager);

    const errorListener = jest.fn();
    const applyListener = jest.fn();

    wrapper.events.on("proxy.apply", applyListener);
    wrapper.events.on("proxy.error", errorListener);

    expect(() => wrapper.proxy()).toThrow(ProxyError);

    const [event]: [nx.ProxyApplyEvent] = applyListener.mock.lastCall;
    const [error]: [nx.ProxyError] = errorListener.mock.lastCall;

    const getResult = await event.data.result;

    expect(() => getResult()).toThrow(ProxyError);
    expect(applyListener).toHaveBeenCalledTimes(1);
    expect(errorListener).toHaveBeenCalledTimes(1);
    expect(manager.events.emit).toHaveBeenCalledWith("proxy.apply", event);
    expect(manager.events.emit).toHaveBeenCalledWith("proxy.error", error);
  });

  it("throws an error while the proxy is locked", () => {
    const wrapper = new ProxyWrapper();
    wrapper.lock();

    expect(() => wrapper.proxy()).toThrow(ProxyError);
    wrapper.unlock();
    expect(() => wrapper.proxy()).not.toThrow();
  });
});
