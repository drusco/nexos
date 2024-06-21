import type nx from "../../lib/types/Nexo.js";
import Nexo from "../../lib/Nexo.js";
import defineProperty from "./defineProperty.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";
import map from "../../lib/maps.js";
import isProxy from "../isProxy.js";

describe("defineProperty", () => {
  it("Emits a defineProperty event", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = Nexo.wrap(proxy);

    const definePropertyCallbackNexo = jest.fn();
    const definePropertyCallbackProxy = jest.fn();

    nexo.on("nx.proxy.defineProperty", definePropertyCallbackNexo);
    wrapper.on("nx.proxy.defineProperty", definePropertyCallbackProxy);

    const result = defineProperty(wrapper, "foo", { value: "bar" });

    const [definePropertyEventForNexo] =
      definePropertyCallbackNexo.mock.lastCall;
    const [definePropertyEventForProxy] =
      definePropertyCallbackProxy.mock.lastCall;

    expect(result).toBe(true);
    expect(definePropertyCallbackNexo).toBeCalledTimes(1);
    expect(definePropertyEventForNexo.target).toBe(proxy);
    expect(definePropertyEventForNexo.cancellable).toBe(true);

    expect(definePropertyEventForNexo.data).toStrictEqual({
      key: "foo",
      descriptor: {
        configurable: false,
        writable: false,
        enumerable: false,
        value: "bar",
      },
    });

    expect(definePropertyCallbackProxy).toBeCalledTimes(1);
    expect(definePropertyEventForProxy).toBe(definePropertyEventForNexo);
  });

  it("Returns false when the event is default prevented", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = Nexo.wrap(proxy);

    wrapper.on(
      "nx.proxy.defineProperty",
      (
        event: ProxyEvent<
          nx.Proxy,
          { key: string; descriptor: PropertyDescriptor }
        >,
      ) => {
        event.preventDefault();
      },
    );

    const result = defineProperty(wrapper, "foo");

    expect(result).toBe(false);
  });

  it("Converts traceable values to proxies", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = Nexo.wrap(proxy);
    const { sandbox } = map.proxies.get(proxy);

    const key = "foo";
    const descriptor: PropertyDescriptor = { value: [] };

    const result = defineProperty(wrapper, key, descriptor);
    const fooDescriptor = sandbox.get(key);

    expect(result).toBe(true);
    expect(isProxy(fooDescriptor.value)).toBe(true);
    expect(fooDescriptor.value).toBe(nexo.proxy(descriptor.value));

    expect(fooDescriptor).toStrictEqual({
      configurable: false,
      enumerable: false,
      writable: false,
      value: nexo.proxy(descriptor.value),
    });
  });
});
