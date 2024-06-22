import type nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import isProxy from "../utils/isProxy.js";
import construct from "./construct.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

describe("construct", () => {
  it("Emits a construct event", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = new ProxyWrapper(proxy);

    const constructCallbackNexo = jest.fn();
    const constructCallbackProxy = jest.fn();

    nexo.on("nx.proxy.construct", constructCallbackNexo);
    wrapper.events.on("nx.proxy.construct", constructCallbackProxy);

    const args = ["foo", "bar"];
    const result = construct(wrapper.fn, args);

    const [constructEventForNexo] = constructCallbackNexo.mock.lastCall;
    const [constructEventForProxy] = constructCallbackProxy.mock.lastCall;

    expect(constructCallbackNexo).toBeCalledTimes(1);
    expect(constructEventForNexo.target).toBe(proxy);
    expect(constructEventForNexo.cancellable).toBe(false);

    expect(constructEventForNexo.data).toStrictEqual({
      arguments: args,
      result,
    });

    expect(constructCallbackProxy).toBeCalledTimes(1);
    expect(constructEventForProxy).toBe(constructEventForNexo);
  });

  it("Returns a new proxy by default", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = new ProxyWrapper(proxy);

    const result = construct(wrapper.fn) as nx.Proxy;
    const resultWrapper = new ProxyWrapper(result);

    expect(isProxy(result)).toBe(true);
    expect(resultWrapper.target).toBeUndefined();
  });

  it("Creates an instance from a function target and returns its proxy", () => {
    const nexo = new Nexo();
    class MyTarget {}
    const proxy = nexo.proxy(MyTarget);
    const wrapper = new ProxyWrapper(proxy);

    const result = construct(wrapper.fn) as nx.Proxy;
    const resultWrapper = new ProxyWrapper(result);

    expect(isProxy(result)).toBe(true);
    expect(resultWrapper.target).toBeInstanceOf(MyTarget);
  });
});
