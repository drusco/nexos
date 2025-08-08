import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyError from "../errors/ProxyError.js";

describe("Construct Handler", () => {
  it("emits a 'proxy.construct' event with correct data", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.on("proxy.construct", listener);
    wrapper.on("proxy.construct", listener);

    const args = ["foo", "bar"];
    const result = Reflect.construct(proxy, args);

    const [event]: [nx.ProxyConstructEvent] = listener.mock.lastCall;
    const getResultFn = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(true);
    expect(event.data.args).toStrictEqual(args);
    expect(getResultFn()).toBe(result);
  });

  it("returns a new proxy instance by default", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    const instance = Reflect.construct(proxy, []);

    expect(Nexo.isProxy(instance)).toBe(true);
  });

  it("constructs an instance using the target constructor", () => {
    const nexo = new Nexo();
    class MyClass {}
    const proxy = nexo.create(MyClass);

    const instance = Reflect.construct(proxy, []);

    expect(instance).toBeInstanceOf(MyClass);
  });

  it("allows event listeners to override the returned instance", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const customInstance = {};

    wrapper.on("proxy.construct", (event: nx.ProxyConstructEvent) => {
      event.preventDefault();
      return customInstance;
    });

    const result = Reflect.construct(proxy, []);

    expect(result).toBe(customInstance);
  });

  it("throws ProxyError if the overridden result is not an object", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    wrapper.on("proxy.construct", (event: nx.ProxyConstructEvent) => {
      event.preventDefault();
      return "invalid" as unknown as object; // not an object
    });

    expect(() => Reflect.construct(proxy, [])).toThrow(ProxyError);
  });

  it("throws ProxyError if the original constructor throws", () => {
    const nexo = new Nexo();
    class ExplodingClass {
      constructor() {
        throw new Error("boom");
      }
    }
    const proxy = nexo.create(ExplodingClass);

    expect(() => Reflect.construct(proxy, [])).toThrow(ProxyError);
  });
});
