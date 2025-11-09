import Nexo from "../Nexo.js";
import getProxy from "../utils/getProxy.js";
import getProxyWrapper from "../utils/getProxyWrapper.js";
import isProxy from "../utils/isProxy.js";
import ProxyError from "../utils/ProxyError.js";
import construct from "./construct.js";

describe("Construct Handler", () => {
  it("creates a new `construct` handler for proxies", () => {
    const proxy = getProxy();
    const resolveProxy = () => proxy;
    const handlerA = construct(resolveProxy);
    const handlerB = construct(resolveProxy);

    expect(handlerA).not.toBe(handlerB);
  });

  it("emits a 'proxy.construct' event", async () => {
    const nexo = new Nexo();
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);
    const listener = jest.fn();

    nexo.events.on("proxy.construct", listener);
    wrapper.events.on("proxy.construct", listener);
    wrapper.setManager(nexo);

    const args = ["foo", "bar"];
    const result = Reflect.construct(proxy, args);

    const [event]: [nx.ProxyConstructEvent] = listener.mock.lastCall;
    const getResult = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(true);
    expect(event.data.args).toStrictEqual(args);
    expect(getResult()).toBe(result);
  });

  it("returns a new proxy instance by default", () => {
    const proxy = getProxy();
    const instance = Reflect.construct(proxy, []);

    expect(isProxy(instance)).toBe(true);
  });

  it("constructs an instance using the target constructor", () => {
    class MyClass {}
    const proxy = getProxy(MyClass);
    const instance = Reflect.construct(proxy, []);

    expect(instance).toBeInstanceOf(MyClass);
  });

  it("allows event listeners to override the returned instance", () => {
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);
    const expectedResult = {};

    wrapper.events.on("proxy.construct", (event: nx.ProxyConstructEvent) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = Reflect.construct(proxy, []);

    expect(result).toBe(expectedResult);
  });

  it("throws ProxyError if the overridden result is not an object", () => {
    const proxy = getProxy();
    const wrapper = getProxyWrapper(proxy);

    wrapper.events.on("proxy.construct", (event: nx.ProxyConstructEvent) => {
      event.preventDefault();
      return "invalid";
    });

    expect(() => Reflect.construct(proxy, [])).toThrow(ProxyError);
  });

  it("throws ProxyError if the original constructor throws", () => {
    class ExplodingClass {
      constructor() {
        throw new Error("boom");
      }
    }
    const proxy = getProxy(ExplodingClass);

    expect(() => Reflect.construct(proxy, [])).toThrow(ProxyError);
  });
});
