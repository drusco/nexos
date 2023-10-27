import Emulator from "../../Emulator.js";
import Exotic from "../../types/Exotic.js";

const $ = new Emulator();

describe("(method) include", () => {
  it("Creates a proxy from an origin without action", () => {
    const target = 360;
    const origin: Exotic.proxy.origin = {};
    const proxy = $.include("", origin, target);
    expect($.target(proxy)).toBe(target);
  });

  it("Creates a proxy from a reference key with default target", () => {
    const reference = "test";
    const target = ["example"];
    const origin: Exotic.proxy.origin = { action: "link", key: reference };

    $.include("", origin, target);

    expect($.links.includes(reference)).toBe(true);
    expect($.link(reference)).toBe($.use(target));
  });

  it("Creates a proxy from a reference key using a linked target", () => {
    const reference = "listener";
    const target = {};
    const origin: Exotic.proxy.origin = { action: "link", key: reference };

    $.link(reference, target);
    $.include("", origin);

    expect($.links.includes(reference)).toBe(true);
    expect($.link(reference)).toBe($.use(target));
  });

  it("Creates a proxy from an origin with a 'set' action", () => {
    const proxy = $.use();
    const value = 100;
    const origin: Exotic.proxy.origin = {
      action: "set",
      key: "test",
      value,
      proxy,
    };
    $.include("", origin);

    expect($.target(proxy.test)).toBe(value);
  });

  it("Creates a proxy from an origin with an 'apply' action", () => {
    const proxy = $.use((n: number) => `test${n}`);
    const origin: Exotic.proxy.origin = {
      action: "apply",
      proxy,
      that: proxy,
      args: [10],
    };
    const newProxy = $.include("", origin);

    expect($.target(newProxy)).toBe("test10");
  });

  it("Creates a proxy from an origin with a 'construct' action", () => {
    class MyClass {}
    const proxy = $.use(MyClass);
    const origin: Exotic.proxy.origin = {
      action: "build",
      proxy,
      args: [10],
    };
    const instance = $.include("", origin);

    expect($.target(instance) instanceof MyClass).toBe(true);
  });

  it("Creates a proxy from an origin with a 'get' action", () => {
    const array = [];
    const proxy = $.use({ test: array });
    const origin: Exotic.proxy.origin = {
      action: "get",
      proxy,
      key: "test",
    };
    const proxyFromGet = $.include("", origin);

    expect($.target(proxyFromGet)).toBe(array);
  });

  it("Creates a link between an existing proxy and a new proxy", () => {
    const proxy = $.use();
    const origin: Exotic.proxy.origin = {
      action: "get",
      proxy,
      key: "test",
    };
    const id = $.encode(proxy);
    const newProxy = $.include(id, origin);

    expect($.decode(id)).toBe(newProxy);
    expect(proxy).not.toBe(newProxy);
  });
});
