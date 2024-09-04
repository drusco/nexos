import type nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";
import ProxyError from "../errors/ProxyError.js";
import { isProxy } from "util/types";

describe("apply", () => {
  it("Emits an apply event with custom data", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy) as ProxyWrapper;

    const applyListener = jest.fn();

    nexo.on("proxy.apply", applyListener);
    wrapper.on("proxy.apply", applyListener);

    const args = ["foo", "bar"];
    const thisArg = {};
    const result = Reflect.apply(proxy, thisArg, args);

    const [applyEvent]: [
      ProxyEvent<{
        target: nx.traceable;
        thisArg?: nx.traceable;
        args: nx.arrayLike;
        result: nx.Proxy;
      }>,
    ] = applyListener.mock.lastCall;

    expect(applyListener).toHaveBeenCalledTimes(2);
    expect(applyEvent).toBeInstanceOf(ProxyEvent);
    expect(applyEvent.target).toBe(proxy);
    expect(applyEvent.cancelable).toBe(true);
    expect(applyEvent.data.thisArg).toBe(thisArg);
    expect(applyEvent.data.args).toStrictEqual(args);
    expect(applyEvent.data.result).toBe(result);
  });

  it("Returns an empty proxy when the proxy does not have a target function", () => {
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

  it("Allows its return value to be defined by a function target", () => {
    const nexo = new Nexo();
    const target = (a: number, b: number): number => a + b;
    const proxy = nexo.create(target);

    const result = Reflect.apply(proxy, undefined, [4, 1]);

    expect(result).toBe(5);
  });

  it("Throws function target errors", () => {
    const nexo = new Nexo();
    const listener = jest.fn();
    const target = () => {
      throw Error("boom");
    };

    nexo.on("error", listener);
    nexo.on("proxy.error", listener);

    const proxy = nexo.create(target);

    expect(proxy).toThrow(ProxyError);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
