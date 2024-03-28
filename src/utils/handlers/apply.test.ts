import Nexo from "../../lib/Nexo.js";
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
    expect(applyEventForProxy.target).toBe(proxy);
    expect(applyEventForProxy.cancellable).toBe(true);
    expect(applyEventForProxy.data.arguments).toBe(args);
    expect(applyEventForProxy.data.this).toBe($this);
  });
});
