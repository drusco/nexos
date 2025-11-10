import Nexo from "../Nexo.js";
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
    const nexo = new Nexo();
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);
    const applyListener = jest.fn();

    nexo.events.on("proxy.apply", applyListener);
    wrapper.events.on("proxy.apply", applyListener);
    wrapper.setManager(nexo);

    const args = ["foo", "bar"];
    const thisArg = {};
    const result = Reflect.apply(proxy, thisArg, args);
    const [event]: [nx.ProxyApplyEvent] = applyListener.mock.lastCall;
    const getResult = await event.data.result;

    expect(applyListener).toHaveBeenCalledTimes(2);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(true);
    expect(event.data.thisArg).toBe(thisArg);
    expect(event.data.args).toStrictEqual(args);
    expect(getResult()).toBe(result);
  });

  it("returns a sandboxed proxy when the original proxy has no function target", () => {
    const proxy = getProxy();
    const result = Reflect.apply(proxy, undefined, []);

    expect(isProxy(result)).toBe(true);
  });

  it("allows event listeners to override the return value", () => {
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);
    const expectedResult = "foo";

    wrapper.events.on("proxy.apply", (event) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = Reflect.apply(proxy, undefined, []);

    expect(result).toBe(expectedResult);
  });

  it("invokes the original function target and returns its result", () => {
    const target = (a: number, b: number): number => a + b;
    const proxy = getProxy(target);
    const result = Reflect.apply(proxy, undefined, [4, 1]);

    expect(result).toBe(5);
  });

  it("throws a ProxyError if the function target throws and emits error events", async () => {
    const target = () => {
      throw new Error("boom");
    };

    const nexo = new Nexo();
    const proxy = getProxy(target);
    const wrapper = getProxyWrapper(proxy);

    const errorListener = jest.fn();
    const applyListener = jest.fn();

    nexo.events.on("proxy.error", errorListener);
    nexo.events.on("proxy.apply", applyListener);
    wrapper.events.on("proxy.error", errorListener);
    wrapper.setManager(nexo);

    expect(() => proxy()).toThrow(ProxyError);

    const [event]: [nx.ProxyApplyEvent] = applyListener.mock.lastCall;
    const getResult = await event.data.result;

    expect(() => getResult()).toThrow(ProxyError);
    expect(errorListener).toHaveBeenCalledTimes(2);
  });
});
