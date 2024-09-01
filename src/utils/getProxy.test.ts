import NexoEvent from "../events/NexoEvent.js";
import ProxyEvent from "../events/ProxyEvent.js";
import Nexo from "../Nexo.js";
import getProxy from "./getProxy.js";
import map from "./maps.js";
import ProxyWrapper from "./ProxyWrapper.js";

describe("getProxy", () => {
  it("Creates a new proxy with custom data", () => {
    const nexo = new Nexo();
    const proxy = getProxy(nexo);
    const wrapper = Nexo.wrap(proxy);
    const data = map.proxies.get(proxy);

    expect(data?.id).toBe(wrapper.id);
    expect(data?.wrapper).toBeInstanceOf(ProxyWrapper);
    expect(data?.nexo).toBeInstanceOf(Nexo);
    expect(data?.revoke).toBeInstanceOf(Function);
    expect(data?.sandbox).toBeInstanceOf(Map);
    expect(data?.revoked).toBe(false);
    expect(data?.traceable).toBe(false);
  });

  it("Creates a new proxy with a custom target", () => {
    const nexo = new Nexo();
    const listener = jest.fn();
    const target = [];

    nexo.on("proxy", listener);

    const proxy = getProxy(nexo, target);

    const [proxyEvent]: [ProxyEvent<{ target: object }>] =
      listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(proxyEvent).toBeInstanceOf(NexoEvent);
    expect(proxyEvent.data.target).toBe(target);
    expect(proxyEvent.target).toBe(proxy);
  });

  it("Creates a new proxy with a custom id", () => {
    const nexo = new Nexo();
    const proxy = getProxy(nexo, undefined, "foo");
    const wrapper = Nexo.wrap(proxy);

    expect(wrapper.id).toBe("foo");
  });

  it("Links internal data using weak maps", () => {
    const nexo = new Nexo();
    const listener = jest.fn();
    const target = [];

    nexo.on("proxy", listener);

    const proxy = getProxy(nexo, target);

    const [proxyEvent]: [ProxyEvent<{ target: object }>] =
      listener.mock.lastCall;

    expect(map.proxies.has(proxy)).toBe(true);
    expect(map.tracables.has(target)).toBe(true);
    expect(map.tracables.has(proxyEvent.data.target)).toBe(true);
  });

  it("Returns an existing proxy", () => {
    const nexo = new Nexo();
    const target = [];
    const proxy = getProxy(nexo);
    const proxyWithTarget = getProxy(nexo, target);

    expect(getProxy(nexo, proxy)).toBe(proxy);
    expect(getProxy(nexo, proxyWithTarget)).toBe(proxyWithTarget);
    expect(getProxy(nexo, target)).toBe(proxyWithTarget);
  });
});
