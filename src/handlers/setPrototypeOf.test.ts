import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyError from "../utils/ProxyError.js";
import ProxyEvent from "../events/ProxyEvent.js";

describe("SetPrototypeOf Handler", () => {
  it("emits an event with custom data", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);
    const listener = jest.fn();
    const prototype = Array.prototype;

    nexo.on("proxy.setPrototypeOf", listener);
    wrapper.on("proxy.setPrototypeOf", listener);

    const result = Reflect.setPrototypeOf(proxy, prototype);

    const [event]: [nx.ProxySetPrototypeOfEvent] = listener.mock.lastCall;
    const getResult: nx.FunctionLike = await event.data.result;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event).toBeInstanceOf(ProxyEvent);
    expect(event.name).toBe("proxy.setPrototypeOf");
    expect(event.cancelable).toBe(true);
    expect(event.target).toBe(proxy);
    expect(event.data.prototype).toBe(prototype);
    expect(result).toBe(true);
    expect(getResult()).toBe(true);
  });

  it("can prevent the default event behavior", async () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    const listener = jest.fn((event: nx.ProxySetPrototypeOfEvent) => {
      event.preventDefault();
      return null;
    });

    nexo.on("proxy.setPrototypeOf", listener);

    const result = Reflect.setPrototypeOf(proxy, Array.prototype);
    const [event]: [nx.ProxySetPrototypeOfEvent] = listener.mock.lastCall;
    const getResult: nx.FunctionLike = await event.data.result;

    expect(result).toBe(true);
    expect(getResult()).toBe(true);
    expect(Reflect.getPrototypeOf(proxy)).toBeNull();
  });

  it("cannot replace the prototype with a non-object", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    nexo.on("proxy.setPrototypeOf", (event: nx.ProxySetPrototypeOfEvent) => {
      event.preventDefault();
      return "non-object" as unknown as object;
    });

    expect(() => {
      Reflect.setPrototypeOf(proxy, Array.prototype);
    }).toThrow(ProxyError);

    expect(Reflect.getPrototypeOf(proxy)).toBeNull();
  });

  it("can set a new prototype on a sandboxed proxy", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const prototype = Array.prototype;

    const result = Reflect.setPrototypeOf(proxy, prototype);

    expect(result).toBe(true);
    expect(Reflect.getPrototypeOf(proxy)).toBe(prototype);
  });

  it("can set a new prototype on a proxy with target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);
    const prototype = Array.prototype;

    const result = Reflect.setPrototypeOf(proxy, prototype);

    expect(result).toBe(true);
    expect(Reflect.getPrototypeOf(proxy)).toBe(prototype);
    expect(Reflect.getPrototypeOf(target)).toBe(prototype);
  });

  it("throws an error when the target is not extensible", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const target = { foo: true };
    const targetProxy = nexo.create(target);
    const prototype = Array.prototype;

    Reflect.preventExtensions(proxy);
    Reflect.preventExtensions(targetProxy);

    expect(() => {
      Reflect.setPrototypeOf(proxy, prototype);
    }).toThrow(ProxyError);

    expect(() => {
      Reflect.setPrototypeOf(proxy, Reflect.getPrototypeOf(proxy));
    }).not.toThrow();

    expect(Reflect.setPrototypeOf(target, prototype)).toBe(false);

    expect(() => {
      Reflect.setPrototypeOf(targetProxy, prototype);
    }).toThrow(ProxyError);

    expect(() => {
      Reflect.setPrototypeOf(targetProxy, Reflect.getPrototypeOf(targetProxy));
    }).not.toThrow();
  });

  it("allows setting prototype to null", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const result = Reflect.setPrototypeOf(proxy, null);

    expect(result).toBe(true);
    expect(Reflect.getPrototypeOf(proxy)).toBe(null);
  });

  it("uses prototype returned by listener after preventDefault", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const proto = { x: true };

    nexo.on("proxy.setPrototypeOf", (event: nx.ProxySetPrototypeOfEvent) => {
      event.preventDefault();
      return proto;
    });

    const result = Reflect.setPrototypeOf(proxy, []);
    expect(result).toBe(true);
    expect(Reflect.getPrototypeOf(proxy)).toBe(proto);
  });

  it("ignores returnValue if preventDefault is not called", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const prototype = Array.prototype;

    nexo.on("proxy.setPrototypeOf", () => {
      return null; // should be ignored unless preventDefault is called
    });

    const result = Reflect.setPrototypeOf(proxy, prototype);
    expect(result).toBe(true);
    expect(Reflect.getPrototypeOf(proxy)).toBe(prototype);
  });

  it("can change the prototype of a function target", () => {
    const fn = function () {};
    const nexo = new Nexo();
    const proxy = nexo.create(fn);
    const proto = Object.prototype;

    const result = Reflect.setPrototypeOf(proxy, proto);
    expect(result).toBe(true);
    expect(Reflect.getPrototypeOf(proxy)).toBe(proto);
  });
});
