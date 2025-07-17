import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "./ProxyEvent.js";
import NexoEvent from "./NexoEvent.js";

describe("ProxyEvent", () => {
  it("extends NexoEvent", () => {
    const event = new ProxyEvent("get");
    expect(event).toBeInstanceOf(NexoEvent);
  });

  it("initializes with default options", () => {
    const event = new ProxyEvent("get");

    expect(event.name).toBe("proxy.get");
    expect(event.target).toBeUndefined();
    expect(event.data).toBeUndefined();
    expect(event.cancelable).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });

  it("constructs with target and prepends 'proxy.' to event name", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const handlerName: nx.ProxyHandler = "construct";

    const event = new ProxyEvent(handlerName, {
      target: proxy,
    });

    expect(event.name).toBe("proxy.construct");
    expect(event.target).toBe(proxy);
    expect(event.data).toBeUndefined();
  });

  it("accepts custom data and marks event as cancelable", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const data = { foo: "bar" };
    const event = new ProxyEvent("defineProperty", {
      target: proxy,
      data,
      cancelable: true,
    });

    expect(event.name).toBe("proxy.defineProperty");
    expect(event.target).toBe(proxy);
    expect(event.data).toBe(data);
    expect(event.cancelable).toBe(true);
  });

  it("emits the proxy event to both Nexo and wrapper listeners", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const handlerName: nx.ProxyHandler = "apply";
    const callback = jest.fn();

    wrapper.on("proxy." + handlerName, callback);
    wrapper.nexo.on("proxy." + handlerName, callback);

    const event = new ProxyEvent(handlerName, { target: proxy });

    // Two events should be triggered with the same instance
    expect(callback).toHaveBeenCalledTimes(2);
    const [[event1], [event2]]: [typeof event][] = callback.mock.calls;

    expect(event1).toBeInstanceOf(ProxyEvent);
    expect(event1).toBe(event2);
    expect(event1).toBe(event);
    expect(event1.name).toBe("proxy." + handlerName);
    expect(event1.target).toBe(proxy);
  });
});
