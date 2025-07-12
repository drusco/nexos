import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "./ProxyEvent.js";

describe("ProxyEvent", () => {
  it("Creates an event with default options", () => {
    const event = new ProxyEvent("get");

    expect(event.target).toBeUndefined();
    expect(event.data).toBeUndefined();
    expect(event.cancelable).toBe(false);
  });

  it("Prefixes 'proxy.' to the proxy handler event names", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const handlerName: nx.ProxyHandler = "construct";

    const event = new ProxyEvent(handlerName, {
      target: proxy,
    });

    expect(event.name).toBe("proxy." + handlerName);
    expect(event.target).toBe(proxy);
    expect(event.data).toBeUndefined();
  });

  it("Emits the proxy event to the nexo and proxy listeners", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const handlerName: nx.ProxyHandler = "apply";
    const callback = jest.fn();

    wrapper.on("proxy." + handlerName, callback);
    wrapper.nexo.on("proxy." + handlerName, callback);

    new ProxyEvent(handlerName, {
      target: proxy,
    });

    const [[proxyEvent], [proxyEvt]]: ProxyEvent[][] = callback.mock.calls;

    expect(callback).toHaveBeenCalledTimes(2);
    expect(proxyEvent).toBe(proxyEvt);
    expect(proxyEvent.name).toBe("proxy." + handlerName);
    expect(proxyEvent.target).toBe(proxy);
  });
});
