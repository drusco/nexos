import Nexo from "../Nexo.js";
import ProxyEvent from "./ProxyEvent.js";
import NexoEvent from "./NexoEvent.js";

describe("ProxyEvent", () => {
  it("initializes with default options and prepends `proxy.` to the event name", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const event = new ProxyEvent("get", { target: proxy });

    expect(event).toBeInstanceOf(NexoEvent);
    expect(event.name).toBe("proxy.get");
    expect(event.target).toBe(proxy);
    expect(event.data).toBeUndefined();
    expect(event.cancelable).toBe(true);
    expect(event.defaultPrevented).toBe(false);
  });

  it("accepts custom event data", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const data = { foo: "bar" };

    const event = new ProxyEvent("defineProperty", {
      target: proxy,
      data,
    });

    expect(event.name).toBe("proxy.defineProperty");
    expect(event.target).toBe(proxy);
    expect(event.data).toBe(data);
  });

  it("throws an error when the target is not a valid proxy", () => {
    expect(() => new ProxyEvent("apply")).toThrow(TypeError);
  });
});
