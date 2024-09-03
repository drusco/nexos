import type nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import isProxy from "../utils/isProxy.js";
import NexoEvent from "../events/NexoEvent.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

describe("apply", () => {
  it("Emits an apply event", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy) as ProxyWrapper;

    const applyListener = jest.fn();

    nexo.on("proxy.apply", applyListener);
    wrapper.on("proxy.apply", applyListener);

    const args = ["foo", "bar"];
    const _this = {};
    const result = Reflect.apply(proxy, _this, args);

    const [applyEvent]: [
      ProxyEvent<{
        target: object;
        this?: object;
        arguments: nx.arrayLike;
        result: nx.Proxy;
      }>,
    ] = applyListener.mock.lastCall;

    expect(applyListener).toHaveBeenCalledTimes(2);
    expect(applyEvent).toBeInstanceOf(ProxyEvent);
    expect(applyEvent.target).toBe(proxy);
    expect(applyEvent.cancelable).toBe(true);
    expect(applyEvent.data.this).toBe(_this);
    expect(applyEvent.data.arguments).toStrictEqual(args);
    expect(applyEvent.data.result).toBe(result);
  });

  it("Returns a new proxy when created without a target", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    const result = Reflect.apply(proxy, undefined, []);

    expect(isProxy(result)).toBe(true);
  });

  it("Allows its return value to be defined by the event listener", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy) as ProxyWrapper;

    const expectedResult = "foo";

    wrapper.on("proxy.apply", (event: ProxyEvent) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = Reflect.apply(proxy, undefined, []);

    expect(result).toBe(expectedResult);
  });

  it("Allows its return value to be converted to a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy) as ProxyWrapper;
    const proxyListener = jest.fn();

    const expectedResult = [];

    wrapper.on("proxy.apply", (event: ProxyEvent) => {
      event.preventDefault();
      return expectedResult;
    });

    nexo.on("proxy", proxyListener);

    const result = Reflect.apply(proxy, undefined, []);
    const expectedProxy = nexo.create(expectedResult);

    const [proxyEvent]: [NexoEvent<nx.Proxy, { target?: nx.traceable }>] =
      proxyListener.mock.lastCall;

    expect(isProxy(result)).toBe(true);
    expect(result).toBe(expectedProxy);
    expect(proxyEvent.data.target).toBe(expectedResult);
  });

  it("Allows its return value to be defined by a function target", () => {
    const nexo = new Nexo();
    const functionTarget = (a: number, b: number): number => a + b;
    const proxy = nexo.create(functionTarget);

    const objReturn = {};
    const fnTargetReturnsObj = () => objReturn;
    const proxy2 = nexo.create(fnTargetReturnsObj);

    const numberResult = Reflect.apply(proxy, undefined, [4, 1]);
    const traceableResult = Reflect.apply(proxy2, undefined, []);
    const traceableResultProxy = nexo.create(objReturn);

    expect(numberResult).toBe(5);
    expect(isProxy(traceableResult)).toBe(true);
    expect(traceableResult).toBe(traceableResultProxy);
  });

  it("Emits an update event when the expected return proxy changes", () => {
    const nexo = new Nexo();
    const updateCallback = jest.fn();

    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy) as ProxyWrapper;
    const expectedResult = "test";
    let expectedProxy;

    wrapper.on("proxy.apply", (event: ProxyEvent<{ result: nx.Proxy }>) => {
      event.preventDefault();
      expectedProxy = event.data.result;
      return expectedResult;
    });

    nexo.on("update", updateCallback);

    Reflect.apply(proxy, undefined, []);

    const [updateEvent] = updateCallback.mock.lastCall;

    expect(updateCallback).toHaveBeenCalledTimes(1);
    expect(updateEvent.target).toBe(expectedProxy);
    expect(updateEvent.cancelable).toBe(false);
    expect(updateEvent.data).toBe(expectedResult);
  });

  it("Emits an update event when the target function is called and the return proxy changes", () => {
    const nexo = new Nexo();
    const updateCallback = jest.fn();

    const expectedResult = [];
    const functionTarget = () => expectedResult;
    const proxy = nexo.create(functionTarget);
    const wrapper = Nexo.wrap(proxy) as ProxyWrapper;

    let expectedProxy;

    wrapper.on("proxy.apply", (event: ProxyEvent<{ result: nx.Proxy }>) => {
      expectedProxy = event.data.result;
    });

    nexo.on("update", updateCallback);

    const result = Reflect.apply(proxy, undefined, []);
    const expectedResultProxy = nexo.create(expectedResult);

    const [updateEvent] = updateCallback.mock.lastCall;

    expect(updateCallback).toHaveBeenCalledTimes(1);
    expect(updateEvent.target).toBe(expectedProxy);
    expect(updateEvent.cancelable).toBe(false);
    expect(updateEvent.data).toBe(expectedResultProxy);
    expect(isProxy(expectedResultProxy)).toBe(true);
    expect(result).toBe(expectedResultProxy);
  });
});
