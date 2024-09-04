import type nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import Nexo from "../Nexo.js";
import ProxyWrapper from "../utils/ProxyWrapper.js";

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
    const wrapper = Nexo.wrap(proxy) as ProxyWrapper;
    const listener = jest.fn();

    wrapper.on("proxy.ownKeys", listener);

    proxy.foo = true;
    proxy.bar = false;

    Reflect.ownKeys(proxy);

    const [ownKeysEvent]: [ProxyEvent<nx.arrayLike>] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(ownKeysEvent.data).toStrictEqual(["foo", "bar"]);
  });
});
