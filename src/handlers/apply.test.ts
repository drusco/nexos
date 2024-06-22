import type nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import isProxy from "../utils/isProxy.js";
import apply from "./apply.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

describe("apply", () => {
  it("Emits an apply event", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = new ProxyWrapper(proxy);

    const applyCallbackNexo = jest.fn();
    const applyCallbackProxy = jest.fn();

    nexo.on("nx.proxy.apply", applyCallbackNexo);
    wrapper.events.on("nx.proxy.apply", applyCallbackProxy);

    const args = ["foo", "bar"];
    const _this = {};
    const result = apply(wrapper.fn, _this, args);

    const [applyEventForNexo] = applyCallbackNexo.mock.lastCall;
    const [applyEventForProxy] = applyCallbackProxy.mock.lastCall;

    expect(applyCallbackNexo).toBeCalledTimes(1);
    expect(applyEventForNexo.target).toBe(proxy);
    expect(applyEventForNexo.cancellable).toBe(true);

    expect(applyEventForNexo.data).toStrictEqual({
      this: _this,
      arguments: args,
      result,
    });

    expect(applyCallbackProxy).toBeCalledTimes(1);
    expect(applyEventForProxy).toBe(applyEventForNexo);
  });

  it("Returns a new proxy by default", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = new ProxyWrapper(proxy);

    const result = apply(wrapper.fn) as nx.Proxy;
    const resultWrapper = new ProxyWrapper(result);

    expect(isProxy(result)).toBe(true);
    expect(resultWrapper.target).toBeUndefined();
  });

  it("Allows its return value to be defined by the event listener", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = new ProxyWrapper(proxy);

    const expectedResult = "foo";

    nexo.on("nx.proxy.apply", (event: ProxyEvent<nx.Proxy, object>) => {
      event.preventDefault();
      event.returnValue = expectedResult;
    });

    const result = apply(wrapper.fn);

    expect(result).toBe(expectedResult);
  });

  it("Allows its return value to be converted to a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = new ProxyWrapper(proxy);

    const expectedResult = [];

    nexo.on("nx.proxy.apply", (event: ProxyEvent<nx.Proxy, object>) => {
      event.preventDefault();
      event.returnValue = expectedResult;
    });

    const result = apply(wrapper.fn);

    expect(isProxy(result)).toBe(true);
    expect(result).toBe(nexo.proxy(expectedResult));
  });

  it("Allows its return value to be defined by a function target", () => {
    const nexo = new Nexo();
    const target = (a: number, b: number): number => a + b;
    const proxy = nexo.proxy(target);
    const wrapper = new ProxyWrapper(proxy);

    const traceableValue = {};
    const target2 = () => traceableValue;
    const proxy2 = nexo.proxy(target2);
    const wrapper2 = new ProxyWrapper(proxy2);

    const numberResult = apply(wrapper.fn, undefined, [4, 1]);
    const traceableResult = apply(wrapper2.fn);

    expect(numberResult).toBe(5);
    expect(isProxy(traceableResult)).toBe(true);
    expect(traceableResult).toBe(nexo.proxy(traceableValue));
  });

  it("Emits an update event when the expected return proxy changes", () => {
    const nexo = new Nexo();
    const updateCallback = jest.fn();

    const proxy = nexo.proxy();
    const wrapper = new ProxyWrapper(proxy);
    const expectedResult = "test";

    let expectedProxy: nx.Proxy;

    nexo.on(
      "nx.proxy.apply",
      (event: ProxyEvent<nx.Proxy, { result: nx.Proxy }>) => {
        event.preventDefault();
        expectedProxy = event.data.result;
        event.returnValue = expectedResult;
      },
    );

    nexo.on("nx.proxy.update", updateCallback);

    apply(wrapper.fn);

    const [updateEvent] = updateCallback.mock.lastCall;

    expect(updateCallback).toBeCalledTimes(1);
    expect(updateEvent.target).toBe(expectedProxy);
    expect(updateEvent.cancellable).toBe(false);
    expect(updateEvent.data).toBe(expectedResult);
  });

  it("Emits an update event when the target function is called and the return proxy changes", () => {
    const nexo = new Nexo();
    const updateCallback = jest.fn();

    const expectedResult = [];
    const functionTarget = () => expectedResult;
    const proxy = nexo.proxy(functionTarget);
    const wrapper = new ProxyWrapper(proxy);

    let expectedProxy: nx.Proxy;

    nexo.on(
      "nx.proxy.apply",
      (event: ProxyEvent<nx.Proxy, { result: nx.Proxy }>) => {
        expectedProxy = event.data.result;
      },
    );

    nexo.on("nx.proxy.update", updateCallback);

    const result = apply(wrapper.fn);

    const [updateEvent] = updateCallback.mock.lastCall;

    expect(updateCallback).toBeCalledTimes(1);
    expect(updateEvent.target).toBe(expectedProxy);
    expect(updateEvent.cancellable).toBe(false);
    expect(updateEvent.data).toBe(nexo.proxy(expectedResult));
    expect(isProxy(updateEvent.data)).toBe(true);
    expect(result).toBe(updateEvent.data);
  });
});
