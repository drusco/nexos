import type * as nx from "../types/Nexo.js";
import Nexo from "../Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import isProxy from "../utils/isProxy.js";
import ProxyError from "../errors/ProxyError.js";

describe("deleteProperty", () => {
  it("Emits a deleteProperty event with custom data", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const wrapper = Nexo.wrap(proxy);

    const listener = jest.fn();

    proxy.foo = true;

    nexo.on("proxy.deleteProperty", listener);
    wrapper.on("proxy.deleteProperty", listener);

    const result = Reflect.deleteProperty(proxy, "foo");

    const [event]: [
      ProxyEvent<{ property: nx.ObjectKey; target: nx.Traceable }>,
    ] = listener.mock.lastCall;

    expect(result).toBe(true);
    expect(isProxy(proxy.foo)).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(event.target).toBe(proxy);
    expect(event.cancelable).toBe(true);
    expect(event.data.property).toBe("foo");
    expect(event.data.target).not.toBeUndefined();
  });

  it("Returns true when the property is deleted from a traceable target", () => {
    const nexo = new Nexo();
    const target = { foo: true };
    const proxy = nexo.create(target);
    const result = Reflect.deleteProperty(proxy, "foo");

    expect(result).toBe(true);
    expect(proxy.foo).toBeUndefined();
  });

  it("Returns true when the property is deleted from an untraceable target", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    proxy.foo = true;

    const result = Reflect.deleteProperty(proxy, "foo");

    expect(result).toBe(true);
    expect(isProxy(proxy.foo)).toBe(true);
  });

  it("Prevents the property deletion", () => {
    const nexo = new Nexo();
    const target = { foo: true };
    const proxy = nexo.create(target);

    nexo.on("proxy.deleteProperty", (event: ProxyEvent) => {
      event.preventDefault();
    });

    const result = Reflect.deleteProperty(proxy, "foo");

    expect(result).toBe(false);
    expect(proxy.foo).toBe(true);
  });

  it("Throws an error if deletion is not possible on proxy with traceable target", () => {
    const nexo = new Nexo();
    const target = {};
    const proxy = nexo.create(target);

    Object.defineProperty(proxy, "foo", { value: true });

    expect(() => delete proxy.foo).toThrow(ProxyError);
    expect(proxy.foo).toBe(true);
  });

  it("Throws an error if deletion is not possible on proxy without traceable target", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    Object.defineProperty(proxy, "foo", { value: true });

    expect(() => delete proxy.foo).toThrow(ProxyError);
    expect(proxy.foo).toBe(true);
  });

  it("Throws an error if deletion is not possible due to freezing", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    proxy.foo = true;
    Object.freeze(proxy);

    expect(() => delete proxy.foo).toThrow(ProxyError);
    expect(proxy.foo).toBe(true);
  });

  it("Throws an error if deletion is not possible due to sealing", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();

    proxy.foo = true;
    Object.seal(proxy);

    expect(() => delete proxy.foo).toThrow(ProxyError);
    expect(proxy.foo).toBe(true);
  });
});
