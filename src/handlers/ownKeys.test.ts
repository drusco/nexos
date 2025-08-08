import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyError from "../errors/ProxyError.js";

describe("OwnKeys Handler", () => {
  it("returns the proxy target own keys", () => {
    const nexo = new Nexo();
    const target = { foo: 1, bar: 2 };
    const proxy = nexo.create(target);

    expect(Reflect.ownKeys(proxy)).toStrictEqual(["foo", "bar"]);
  });

  it("returns the default proxy sandbox own keys", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    expect(Reflect.ownKeys(proxy)).toStrictEqual([]);
  });

  it("returns the custom proxy sandbox own keys", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    proxy.foo = true;

    expect(Reflect.ownKeys(proxy)).toStrictEqual(["foo"]);
  });

  it("emits a 'proxy.ownKeys' event", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();

    nexo.on("proxy.ownKeys", listener);
    wrapper.on("proxy.ownKeys", listener);

    proxy.foo = true;

    const result = Reflect.ownKeys(proxy);

    const [event]: [nx.ProxyOwnKeysEvent] = listener.mock.lastCall;
    const getResultFn: nx.FunctionLike = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event.target).toBe(proxy);
    expect(event.name).toBe("proxy.ownKeys");
    expect(event.cancelable).toBe(true);
    expect(result).toStrictEqual(["foo"]);
    expect(getResultFn()).toStrictEqual(["foo"]);
  });

  it("prevents the default event behavior on sandboxed proxies", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const customResult = ["custom", "keys"];

    const listener = jest.fn((event: nx.ProxyOwnKeysEvent) => {
      event.preventDefault();
      return customResult;
    });

    Nexo.wrap(proxy).on("proxy.ownKeys", listener);

    const result = Reflect.ownKeys(proxy);
    const [event]: [nx.ProxyOwnKeysEvent] = listener.mock.lastCall;
    const getResult: nx.FunctionLike = await event.data.result;

    expect(event.returnValue).toStrictEqual(customResult);
    expect(result).toStrictEqual(customResult);
    expect(getResult()).toStrictEqual(customResult);
  });

  it("prevents the default event behavior on proxies with target", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create({ foo: true, bar: true });
    const customResult = [];

    const listener = jest.fn((event: nx.ProxyOwnKeysEvent) => {
      event.preventDefault();
      return customResult;
    });

    Nexo.wrap(proxy).on("proxy.ownKeys", listener);

    const result = Reflect.ownKeys(proxy);
    const [event]: [nx.ProxyOwnKeysEvent] = listener.mock.lastCall;
    const getResult: nx.FunctionLike = await event.data.result;

    expect(event.returnValue).toStrictEqual(customResult);
    expect(result).toStrictEqual(customResult);
    expect(getResult()).toStrictEqual(customResult);
  });

  it("throws when the return value is not an array of strings or symbols", () => {
    const nexo = new Nexo();
    const proxyA = nexo.create();
    const proxyB = nexo.create();

    const returnInvalid = jest.fn((event: nx.ProxyOwnKeysEvent) => {
      event.preventDefault();
      return "invalid" as unknown as nx.ObjectKey[];
    });

    const returnInvalidArray = jest.fn((event: nx.ProxyOwnKeysEvent) => {
      event.preventDefault();
      return [
        "includes more than strings and symbols",
        true,
        null,
        123,
      ] as unknown as nx.ObjectKey[];
    });

    Nexo.wrap(proxyA).on("proxy.ownKeys", returnInvalid);
    Nexo.wrap(proxyB).on("proxy.ownKeys", returnInvalidArray);

    expect(() => Reflect.ownKeys(proxyA)).toThrow(ProxyError);
    expect(() => Reflect.ownKeys(proxyB)).toThrow(ProxyError);
  });
});
