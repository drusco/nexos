import Nexo from "../Nexo.js";
import defineProperty from "./defineProperty.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

describe("defineProperty", () => {
  it("Emits a defineProperty event", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = new ProxyWrapper(proxy);

    const definePropertyCallbackNexo = jest.fn();
    const definePropertyCallbackProxy = jest.fn();

    nexo.events.on("nx.proxy.defineProperty", definePropertyCallbackNexo);
    wrapper.events.on("nx.proxy.defineProperty", definePropertyCallbackProxy);

    const result = defineProperty(wrapper.fn, "foo", { value: "bar" });

    const [definePropertyEventForNexo] =
      definePropertyCallbackNexo.mock.lastCall;
    const [definePropertyEventForProxy] =
      definePropertyCallbackProxy.mock.lastCall;

    expect(result).toBe(true);
    expect(definePropertyCallbackNexo).toHaveBeenCalledTimes(1);
    expect(definePropertyEventForNexo.target).toBe(proxy);
    expect(definePropertyEventForNexo.cancellable).toBe(true);

    expect(definePropertyEventForNexo.data).toStrictEqual({
      property: "foo",
      descriptor: {
        value: "bar",
      },
    });

    expect(definePropertyCallbackProxy).toHaveBeenCalledTimes(1);
    expect(definePropertyEventForProxy).toBe(definePropertyEventForNexo);
  });

  it("Returns false when the event is default prevented", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = new ProxyWrapper(proxy);

    wrapper.events.on(
      "nx.proxy.defineProperty",
      (
        event: ProxyEvent<{ property: string; descriptor: PropertyDescriptor }>,
      ) => {
        event.preventDefault();
      },
    );

    const result = defineProperty(wrapper.fn, "foo", { value: 5 });

    expect(result).toBe(false);
    expect(proxy.foo).not.toBe(5);
  });

  it("Cannot define properties on frozen proxies", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = new ProxyWrapper(proxy);

    Object.freeze(proxy);

    const result = defineProperty(wrapper.fn, "foo", { value: 10 });

    expect(result).toBe(false);
    expect(Object.isFrozen(proxy)).toBe(true);
  });

  it("Cannot define properties on sealed proxies", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = new ProxyWrapper(proxy);

    Object.seal(proxy);

    const result = defineProperty(wrapper.fn, "foo", { value: 20 });

    expect(result).toBe(false);
    expect(Object.isSealed(proxy)).toBe(true);
  });

  it("Cannot define properties on non-extensible proxies", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = new ProxyWrapper(proxy);

    Object.preventExtensions(proxy);

    const result = defineProperty(wrapper.fn, "foo", { value: 30 });

    expect(result).toBe(false);
    expect(Object.isExtensible(proxy)).toBe(false);
  });
});
