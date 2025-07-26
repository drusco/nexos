import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";

describe("apply handler", () => {
  let nexo: Nexo;
  beforeEach(() => {
    nexo = new Nexo();
  });

  it("emits 'proxy.apply' event with correct data and result promise", async () => {
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const applyListener = jest.fn();

    nexo.on("proxy.apply", applyListener);
    wrapper.on("proxy.apply", applyListener);

    const args = ["foo", "bar"];
    const thisArg = {};
    const result = Reflect.apply(proxy, thisArg, args);

    // Check the last call to the applyListener, should be a ProxyApplyEvent
    const [applyEvent]: [nx.ProxyApplyEvent] = applyListener.mock.lastCall;
    const getResultFn = await applyEvent.data.result;

    expect(applyListener).toHaveBeenCalledTimes(2);
    expect(applyEvent).toBeInstanceOf(ProxyEvent);
    expect(applyEvent.target).toBe(proxy);
    expect(applyEvent.cancelable).toBe(true);
    expect(applyEvent.data.thisArg).toBe(thisArg);
    expect(applyEvent.data.args).toStrictEqual(args);

    // The resolved function from event.data.result should return the same result
    expect(getResultFn()).toBe(result);
  });

  it("returns an empty proxy when the original proxy has no function target", () => {
    const proxy = nexo.create();
    const result = Reflect.apply(proxy, undefined, []);

    expect(Nexo.isProxy(result)).toBe(true);
  });

  it("allows event listeners to override the return value by calling preventDefault", () => {
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const expectedResult = "foo";

    wrapper.on("proxy.apply", (event: nx.ProxyApplyEvent) => {
      event.preventDefault();
      return expectedResult;
    });

    const result = Reflect.apply(proxy, undefined, []);

    expect(result).toBe(expectedResult);
  });

  it("invokes the original function target and returns its result", () => {
    const target = (a: number, b: number): number => a + b;
    const proxy = nexo.create(target);

    const result = Reflect.apply(proxy, undefined, [4, 1]);

    expect(result).toBe(5);
  });

  it("throws a ProxyError if the function target throws and emits error events", async () => {
    const errorListener = jest.fn();
    const applyListener = jest.fn();
    const target = () => {
      throw new Error("boom");
    };

    nexo.on("error", errorListener);
    nexo.on("proxy.error", errorListener);
    nexo.on("proxy.apply", applyListener);

    const proxy = nexo.create(target);

    // Verify the proxy throws ProxyError synchronously
    expect(() => proxy()).toThrow(ProxyError);

    // Listeners should have been called twice (error & proxy.error)
    expect(errorListener).toHaveBeenCalledTimes(2);

    // The apply event listener is called and the result promise rejects with ProxyError
    const [applyEvent]: [nx.ProxyApplyEvent] = applyListener.mock.lastCall;
    const getResultFn = await applyEvent.data.result;

    // Invoking the function resolved from event.data.result should throw ProxyError
    expect(() => getResultFn()).toThrow(ProxyError);
  });
});
