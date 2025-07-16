import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import isProxy from "../utils/isProxy.js";
import ProxyError from "../errors/ProxyError.js";

describe("construct", () => {
  it("Emits a construct event with custom data", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const constructListener = jest.fn();

    nexo.on("proxy.construct", constructListener);
    wrapper.on("proxy.construct", constructListener);

    const args = ["foo", "bar"];
    const result = Reflect.construct(proxy, args);

    const [constructEvent]: [nx.ProxyConstructEvent] =
      constructListener.mock.lastCall;

    expect(constructListener).toHaveBeenCalledTimes(2);
    expect(constructEvent.target).toBe(proxy);
    expect(constructEvent.cancelable).toBe(true);
    expect(constructEvent.data.args).toStrictEqual(args);
    expect(constructEvent.data.result).toBe(result);
  });

  it("Returns a new proxy by default", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    const result = Reflect.construct(proxy, []);

    expect(isProxy(result)).toBe(true);
  });

  it("Creates an instance from a constructor target and returns it", () => {
    const nexo = new Nexo();
    class MyTarget {}
    const proxy = nexo.create(MyTarget);

    const result = Reflect.construct(proxy, []);

    expect(result).toBeInstanceOf(MyTarget);
  });

  it("Allows its return value to be defined by the event listener", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const expectedResult = {};

    wrapper.on("proxy.construct", (event: nx.ProxyConstructEvent) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = Reflect.construct(proxy, []);

    expect(result).toBe(expectedResult);
  });

  it("Throws an error when defining a non-object as the return value", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    wrapper.on("proxy.construct", (event: nx.ProxyConstructEvent) => {
      event.preventDefault();
      return "non-object";
    });

    expect(Reflect.construct.bind(null, proxy, [])).toThrow(ProxyError);
  });

  it("Throws an error when the target constructor fails", () => {
    const nexo = new Nexo();
    class target {
      constructor() {
        throw Error("boom");
      }
    }
    const proxy = nexo.create(target);

    expect(Reflect.construct.bind(null, proxy, [])).toThrow(ProxyError);
  });
});
