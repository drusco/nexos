import Nexo from "../../lib/Nexo.js";
import NexoEvent from "../../lib/events/NexoEvent.js";
import apply from "./apply.js";

const nexo = new Nexo();

describe("apply", () => {
  it("Emits an event to the nexo class and to the proxy", () => {
    const proxy = nexo.proxy();
    const wrapper = Nexo.wrap(proxy);
    const args = ["foo", 123, { test: true }];
    const $this = {};
    const applyCallbackNexo = jest.fn();
    const applyCallbackProxy = jest.fn();

    nexo.on("nx.proxy.apply", applyCallbackNexo);
    wrapper.on("nx.proxy.apply", applyCallbackProxy);

    apply(wrapper, $this, args);

    const [applyEventForNexo] = applyCallbackNexo.mock.lastCall;
    const [applyEventForProxy] = applyCallbackProxy.mock.lastCall;

    expect(applyCallbackNexo).toBeCalledTimes(1);
    expect(applyEventForNexo.target).toBe(proxy);
    expect(applyEventForNexo.cancellable).toBe(true);
    expect(applyEventForNexo.data.arguments).toBe(args);
    expect(applyEventForNexo.data.this).toBe($this);

    expect(applyCallbackProxy).toBeCalledTimes(1);
    expect(applyEventForProxy).toBe(applyEventForNexo);
  });

  it("Allows its return value to be defined by the event listener", () => {
    const proxy = nexo.proxy();
    const wrapper = Nexo.wrap(proxy);
    const args = ["foo", 123, { test: true }];
    const $this = {};
    const expectedResult = [];

    nexo.on("nx.proxy.apply", (event: NexoEvent) => {
      event.preventDefault();
      event.returnValue = expectedResult;
    });

    const result = apply(wrapper, $this, args);

    expect(result).toBe(expectedResult);
  });
});
