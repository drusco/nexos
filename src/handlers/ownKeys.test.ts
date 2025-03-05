import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import Nexo from "../Nexo.js";

describe("ownKeys", () => {
  it("Returns the proxy target own keys", () => {
    const nexo = new Nexo();
    const target = { test: true, keys: 2 };
    const proxy = nexo.create(target);

    const result = Reflect.ownKeys(proxy);

    expect(result).toStrictEqual(["test", "keys"]);
  });

  it("Emits an ownKeys event", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.on("proxy.ownKeys", listener);
    wrapper.on("proxy.ownKeys", listener);

    proxy.foo = true;
    proxy.bar = false;

    Reflect.ownKeys(proxy);

    const [ownKeysEvent]: [ProxyEvent<{ result: nx.ArrayLike }>] =
      listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(ownKeysEvent.target).toBe(proxy);
    expect(ownKeysEvent.cancelable).toBe(false);
    expect(ownKeysEvent.data.result).toStrictEqual(["foo", "bar"]);
  });
});
