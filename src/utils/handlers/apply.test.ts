import Nexo from "../../lib/Nexo.js";
import NexoEvent from "../../lib/events/NexoEvent.js";
import isProxy from "../isProxy.js";
import apply from "./apply.js";

describe("apply", () => {
  it("Emits an event to the nexo class and to the proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = Nexo.wrap(proxy);
    const args = ["foo", 123, { test: true }];
    const _this = {};
    const applyCallbackNexo = jest.fn();
    const applyCallbackProxy = jest.fn();

    nexo.on("nx.proxy.apply", applyCallbackNexo);
    wrapper.on("nx.proxy.apply", applyCallbackProxy);

    apply(wrapper, _this, args);

    const [applyEventForNexo] = applyCallbackNexo.mock.lastCall;
    const [applyEventForProxy] = applyCallbackProxy.mock.lastCall;

    expect(applyCallbackNexo).toBeCalledTimes(1);
    expect(applyEventForNexo.target).toBe(proxy);
    expect(applyEventForNexo.cancellable).toBe(true);
    expect(applyEventForNexo.data).toStrictEqual({
      this: _this,
      arguments: args,
    });

    expect(applyCallbackProxy).toBeCalledTimes(1);
    expect(applyEventForProxy).toBe(applyEventForNexo);
  });

  it("Allows its return value to be defined by the event listener", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const wrapper = Nexo.wrap(proxy);
    const args = ["foo", "bar", 100];
    const _this = undefined;
    const expectedResult = [];

    nexo.on("nx.proxy.apply", (event: NexoEvent) => {
      event.preventDefault();
      event.returnValue = expectedResult;
    });

    const result = apply(wrapper, _this, args);

    expect(result).toBe(expectedResult);
  });

  it("Allows its return value to be defined by a function target", () => {
    const nexo = new Nexo();
    const target = (a: number, b: number): number => a + b;
    const args = [4, 1];
    const _this = undefined;
    const proxy = nexo.proxy(target);
    const wrapper = Nexo.wrap(proxy);

    const result = apply(wrapper, _this, args);

    expect(result).toBe(5);
  });

  it("Returns a new proxy by default", () => {
    const nexo = new Nexo();
    const proxy = nexo.proxy();
    const args = [];
    const _this = undefined;
    const wrapper = Nexo.wrap(proxy);

    const result = apply(wrapper, _this, args);

    expect(isProxy(result)).toBe(true);
  });
});
