import NexoTS from "../../lib/types/Nexo.js";
import Nexo from "../../lib/Nexo.js";
import ProxyEvent from "../../lib/events/ProxyEvent.js";
import isProxy from "../isProxy.js";
import apply from "./apply.js";

describe("apply", () => {
  it("Emits an apply event", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = Nexo.wrap(proxy);

    const applyCallbackNexo = jest.fn();
    const applyCallbackProxy = jest.fn();

    nexo.on("nx.proxy.apply", applyCallbackNexo);
    wrapper.on("nx.proxy.apply", applyCallbackProxy);

    const args = ["foo", "bar", 100];
    const _this = {};
    const result = apply(wrapper, _this, args);

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

  it("Allows its return value to be defined by the event listener", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = Nexo.wrap(proxy);

    const expectedResult = "foo";

    nexo.on("nx.proxy.apply", (event: ProxyEvent<NexoTS.Proxy, object>) => {
      event.preventDefault();
      event.returnValue = expectedResult;
    });

    const args = ["foo", "bar", 100];
    const _this = undefined;
    const result = apply(wrapper, _this, args);

    expect(result).toBe(expectedResult);
  });

  it("Allows its return value to be converted to a proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = Nexo.wrap(proxy);

    const expectedResult = [];

    nexo.on("nx.proxy.apply", (event: ProxyEvent<NexoTS.Proxy, object>) => {
      event.preventDefault();
      event.returnValue = expectedResult;
    });

    const args = ["foo", "bar", 100];
    const _this = undefined;
    const result = apply(wrapper, _this, args);

    expect(result).toBe(nexo.proxy(expectedResult));
  });

  it("Allows its return value to be defined by a function target", () => {
    const nexo = new Nexo();
    const target = (a: number, b: number): number => a + b;
    const proxy = nexo.proxy(target);
    const wrapper = Nexo.wrap(proxy);

    const args = [4, 1];
    const _this = undefined;
    const result = apply(wrapper, _this, args);

    expect(result).toBe(5);
  });

  it("Returns a new proxy by default", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = Nexo.wrap(proxy);

    const args = [];
    const _this = undefined;
    const result = apply(wrapper, _this, args) as NexoTS.Proxy;

    expect(isProxy(result)).toBe(true);
    expect(Nexo.wrap(result).target).toBeUndefined();
  });

  it("Emits an update event when the expected return proxy changes", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = Nexo.wrap(proxy);

    const args = [];
    const _this = undefined;
    const expectedResult = "test";
    let expectedProxy: NexoTS.Proxy;

    const updateCallback = jest.fn();

    nexo.on(
      "nx.proxy.apply",
      (event: ProxyEvent<NexoTS.Proxy, { result: NexoTS.Proxy }>) => {
        event.preventDefault();
        expectedProxy = event.data.result;
        event.returnValue = expectedResult;
      },
    );

    nexo.on("nx.proxy.update", updateCallback);

    apply(wrapper, _this, args);

    const [updateEvent] = updateCallback.mock.lastCall;

    expect(updateCallback).toBeCalledTimes(1);
    expect(updateEvent.target).toBe(expectedProxy);
    expect(updateEvent.cancellable).toBe(false);
    expect(updateEvent.data).toBe(expectedResult);
  });
});
