import type nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import isProxy from "../utils/isProxy.js";
import apply from "./apply.js";

describe("apply", () => {
  it("Emits an apply event", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const applyCallbackNexo = jest.fn();
    const applyCallbackProxy = jest.fn();

    nexo.on("proxy.apply", applyCallbackNexo);
    wrapper.on("proxy.apply", applyCallbackProxy);

    const args = ["foo", "bar"];
    const _this = {};
    const result = apply(wrapper.fn, _this, args);

    const [applyEventForNexo] = applyCallbackNexo.mock.lastCall;
    const [applyEventForProxy] = applyCallbackProxy.mock.lastCall;

    expect(applyCallbackNexo).toHaveBeenCalledTimes(1);
    expect(applyEventForNexo).toBeInstanceOf(ProxyEvent);
    expect(applyEventForNexo.target).toBe(proxy);
    expect(applyEventForNexo.cancelable).toBe(true);

    expect(applyEventForNexo.data).toStrictEqual({
      this: _this,
      arguments: args,
      result,
    });

    expect(applyCallbackProxy).toHaveBeenCalledTimes(1);
    expect(applyEventForProxy).toBe(applyEventForNexo);
  });

  it("Returns a new proxy by default", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const result = apply(wrapper.fn) as nx.Proxy;
    const resultWrapper = Nexo.wrap(result);

    expect(isProxy(result)).toBe(true);
    expect(resultWrapper.target).toBeUndefined();
  });

  it("Allows its return value to be defined by the event listener", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const expectedResult = "foo";

    wrapper.on("proxy.apply", (event: ProxyEvent) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = apply(wrapper.fn);

    expect(result).toBe(expectedResult);
  });

  it("Allows its return value to be converted to a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const expectedResult = [];

    wrapper.on("proxy.apply", (event: ProxyEvent) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = apply(wrapper.fn);
    const expectedProxy = nexo.create(expectedResult);
    const resultWrapper = Nexo.wrap(expectedProxy);

    expect(isProxy(result)).toBe(true);
    expect(result).toBe(expectedProxy);
    expect(resultWrapper.target).toBe(expectedResult);
  });

  it("Allows its return value to be defined by a function target", () => {
    const nexo = new Nexo();
    const functionTarget = (a: number, b: number): number => a + b;
    const proxy = nexo.create(functionTarget);
    const wrapper = Nexo.wrap(proxy);

    const objReturn = {};
    const fnTargetReturnsObj = () => objReturn;
    const proxy2 = nexo.create(fnTargetReturnsObj);
    const wrapper2 = Nexo.wrap(proxy2);

    const numberResult = apply(wrapper.fn, undefined, [4, 1]);
    const traceableResult = apply(wrapper2.fn);
    const traceableResultProxy = nexo.create(objReturn);

    expect(numberResult).toBe(5);
    expect(isProxy(traceableResult)).toBe(true);
    expect(traceableResult).toBe(traceableResultProxy);
  });

  it("Emits an update event when the expected return proxy changes", () => {
    const nexo = new Nexo();
    const updateCallback = jest.fn();

    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const expectedResult = "test";

    let expectedProxy: nx.Proxy;

    wrapper.on("proxy.apply", (event: ProxyEvent<{ result: nx.Proxy }>) => {
      event.preventDefault();
      expectedProxy = event.data.result;
      return expectedResult;
    });

    nexo.on("update", updateCallback);

    apply(wrapper.fn);

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
    const wrapper = Nexo.wrap(proxy);

    let expectedProxy: nx.Proxy;

    wrapper.on("proxy.apply", (event: ProxyEvent<{ result: nx.Proxy }>) => {
      expectedProxy = event.data.result;
    });

    nexo.on("update", updateCallback);

    const result = apply(wrapper.fn);
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
