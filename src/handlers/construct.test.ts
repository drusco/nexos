import type nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import isProxy from "../utils/isProxy.js";
import ProxyEvent from "../events/ProxyEvent.js";
import NexoEvent from "../events/NexoEvent.js";
import ProxyError from "../errors/ProxyError.js";

describe("construct", () => {
  it("Emits a construct event", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const constructListener = jest.fn();

    nexo.on("proxy.construct", constructListener);
    wrapper.on("proxy.construct", constructListener);

    const args = ["foo", "bar"];
    const result = Reflect.construct(proxy, args);

    const [constructEvent]: [
      ProxyEvent<{ target: object; arguments: nx.arrayLike; result: nx.Proxy }>,
    ] = constructListener.mock.lastCall;

    expect(constructListener).toHaveBeenCalledTimes(2);
    expect(constructEvent.target).toBe(proxy);
    expect(constructEvent.cancelable).toBe(true);
    expect(constructEvent.data.arguments).toStrictEqual(args);
    expect(constructEvent.data.result).toBe(result);
  });

  it("Returns a new proxy by default", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    const result = Reflect.construct(proxy, []);

    expect(isProxy(result)).toBe(true);
  });

  it("Creates an instance from a function target and returns its proxy", () => {
    const nexo = new Nexo();
    class MyTarget {}
    const proxy = nexo.create(MyTarget);
    const listener = jest.fn();

    nexo.on("proxy", listener);

    const result = Reflect.construct(proxy, []);

    const [proxyEvent]: [NexoEvent<nx.Proxy, { target?: nx.traceable }>] =
      listener.mock.lastCall;

    expect(isProxy(result)).toBe(true);
    expect(proxyEvent.data.target).toBeInstanceOf(MyTarget);
  });

  it("Allows its return value to be defined by the event listener", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    const expectedTarget = {};

    nexo.on("proxy", listener);

    wrapper.on("proxy.construct", (event: ProxyEvent) => {
      event.preventDefault();
      return expectedTarget;
    });

    const result = Reflect.construct(proxy, []);

    const [constructEvent]: [ProxyEvent<{ target: object }>] =
      listener.mock.lastCall;

    expect(isProxy(result)).toBe(true);
    expect(constructEvent.data.target).toBe(expectedTarget);
  });

  it("Throws when defining a non-object as the return value", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    wrapper.on("proxy.construct", (event: ProxyEvent) => {
      event.preventDefault();
      return "non-object";
    });

    expect(Reflect.construct.bind(null, proxy, [])).toThrow(ProxyError);
  });

  it("Emits an update event when the expected return proxy changes", () => {
    const nexo = new Nexo();
    const updateCallback = jest.fn();

    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const expectedResult = {};

    let expectedProxy;

    wrapper.on("proxy.construct", (event: ProxyEvent<{ result: nx.Proxy }>) => {
      event.preventDefault();
      expectedProxy = event.data.result;
      return expectedResult;
    });

    nexo.on("update", updateCallback);

    Reflect.construct(proxy, []);

    const [updateEvent] = updateCallback.mock.lastCall;

    expect(updateCallback).toHaveBeenCalledTimes(1);
    expect(updateEvent.target).toBe(expectedProxy);
    expect(updateEvent.cancelable).toBe(false);
    expect(updateEvent.data).toBe(nexo.create(expectedResult));
  });

  it("Emits an update event when the target is instantiated and the return proxy changes", () => {
    const nexo = new Nexo();
    const updateCallback = jest.fn();

    const constructable = function () {};
    const proxy = nexo.create(constructable);
    const wrapper = Nexo.wrap(proxy);

    let expectedProxy;

    wrapper.on("proxy.construct", (event: ProxyEvent<{ result: nx.Proxy }>) => {
      expectedProxy = event.data.result;
    });

    nexo.on("update", updateCallback);

    const result = Reflect.construct(proxy, []);
    const [updateEvent] = updateCallback.mock.lastCall;

    expect(updateCallback).toHaveBeenCalledTimes(1);
    expect(updateEvent.target).toBe(expectedProxy);
    expect(updateEvent.cancelable).toBe(false);
    expect(updateEvent.data).toBeInstanceOf(constructable);
    expect(isProxy(result)).toBe(true);
    expect(result).toBe(updateEvent.data);
  });
});
