import type nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import isProxy from "../utils/isProxy.js";
import construct from "./construct.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";
import ProxyEvent from "../events/ProxyEvent.js";

describe("construct", () => {
  it("Emits a construct event", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = new ProxyWrapper(proxy);

    const constructCallbackNexo = jest.fn();
    const constructCallbackProxy = jest.fn();

    nexo.events.on("nx.proxy.construct", constructCallbackNexo);
    wrapper.events.on("nx.proxy.construct", constructCallbackProxy);

    const args = ["foo", "bar"];
    const result = construct(wrapper.fn, args);

    const [constructEventForNexo] = constructCallbackNexo.mock.lastCall;
    const [constructEventForProxy] = constructCallbackProxy.mock.lastCall;

    expect(constructCallbackNexo).toBeCalledTimes(1);
    expect(constructEventForNexo.target).toBe(proxy);
    expect(constructEventForNexo.cancellable).toBe(true);

    expect(constructEventForNexo.data).toStrictEqual({
      arguments: args,
      result,
    });

    expect(constructCallbackProxy).toBeCalledTimes(1);
    expect(constructEventForProxy).toBe(constructEventForNexo);
  });

  it("Returns a new proxy by default", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = new ProxyWrapper(proxy);

    const result = construct(wrapper.fn) as nx.Proxy;
    const resultWrapper = new ProxyWrapper(result);

    expect(isProxy(result)).toBe(true);
    expect(resultWrapper.target).toBeUndefined();
  });

  it("Creates an instance from a function target and returns its proxy", () => {
    const nexo = new Nexo();
    class MyTarget {}
    const proxy = nexo.create(MyTarget);
    const wrapper = new ProxyWrapper(proxy);

    const result = construct(wrapper.fn) as nx.Proxy;
    const resultWrapper = new ProxyWrapper(result);

    expect(isProxy(result)).toBe(true);
    expect(resultWrapper.target).toBeInstanceOf(MyTarget);
  });

  it("Allows its return value to be defined by the event listener", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = new ProxyWrapper(proxy);

    const expectedResult = "foo";

    wrapper.events.on("nx.proxy.construct", (event: ProxyEvent) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = construct(wrapper.fn);

    expect(result).toBe(expectedResult);
  });

  it("Allows its return value to be converted to a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = new ProxyWrapper(proxy);

    const expectedResult = [];

    wrapper.events.on("nx.proxy.construct", (event: ProxyEvent) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = construct(wrapper.fn);
    const expectedProxy = nexo.create(expectedResult);
    const resultWrapper = new ProxyWrapper(expectedProxy);

    expect(isProxy(result)).toBe(true);
    expect(result).toBe(expectedProxy);
    expect(resultWrapper.target).toBe(expectedResult);
  });

  it("Emits an update event when the expected return proxy changes", () => {
    const nexo = new Nexo();
    const updateCallback = jest.fn();

    const proxy = nexo.create();
    const wrapper = new ProxyWrapper(proxy);
    const expectedResult = "test";

    let expectedProxy: nx.Proxy;

    wrapper.events.on(
      "nx.proxy.construct",
      (event: ProxyEvent<{ result: nx.Proxy }>) => {
        event.preventDefault();
        expectedProxy = event.data.result;
        return expectedResult;
      },
    );

    nexo.events.on("nx.update", updateCallback);

    construct(wrapper.fn);

    const [updateEvent] = updateCallback.mock.lastCall;

    expect(updateCallback).toBeCalledTimes(1);
    expect(updateEvent.target).toBe(expectedProxy);
    expect(updateEvent.cancellable).toBe(false);
    expect(updateEvent.data).toBe(expectedResult);
  });

  it("Emits an update event when the target is instantiated and the return proxy changes", () => {
    const nexo = new Nexo();
    const updateCallback = jest.fn();

    const constructable = function () {};
    const proxy = nexo.create(constructable);
    const wrapper = new ProxyWrapper(proxy);

    let expectedProxy: nx.Proxy;

    wrapper.events.on(
      "nx.proxy.construct",
      (event: ProxyEvent<{ result: nx.Proxy }>) => {
        expectedProxy = event.data.result;
      },
    );

    nexo.events.on("nx.update", updateCallback);

    const result = construct(wrapper.fn);
    const [updateEvent] = updateCallback.mock.lastCall;

    expect(updateCallback).toBeCalledTimes(1);
    expect(updateEvent.target).toBe(expectedProxy);
    expect(updateEvent.cancellable).toBe(false);
    expect(updateEvent.data).toBeInstanceOf(constructable);
    expect(isProxy(result)).toBe(true);
    expect(result).toBe(updateEvent.data);
  });
});
