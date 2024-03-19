import Nexo from "../Nexo.js";
import { encode, getProxyPayload } from "./index.js";

const nexo = new Nexo();

describe("encode", () => {
  it("Creates a shallow copy for plain objects or arrays", () => {
    const data = {
      foo: "file",
      bar: [10, 20],
      test: true,
    };

    const result = encode(data) as typeof data;

    expect(result).not.toBe(data);
    expect(result.foo).toBe("file");
    expect(result.bar).toEqual([10, 20]);
    expect(result.bar).not.toBe(data.bar);
    expect(result.test).toBe(true);
  });

  it("Returns the same value if it is not an array or a plain object", () => {
    const symbol = Symbol();
    const map = new Map();
    const date = new Date();

    expect(encode(true)).toBe(true);
    expect(encode(false)).toBe(false);
    expect(encode(NaN)).toBe(NaN);
    expect(encode(Infinity)).toBe(Infinity);
    expect(encode("foo")).toBe("foo");
    expect(encode(symbol)).toBe(symbol);
    expect(encode(null)).toBe(null);
    expect(encode(undefined)).toBe(undefined);
    expect(encode(100)).toBe(100);
    expect(encode(10.5)).toBe(10.5);
    expect(encode(map)).toBe(map);
    expect(encode(date)).toBe(date);
    expect(encode(nexo)).toBe(nexo);
  });

  it("Handles circular references by using an internal cache", () => {
    const foo = { bar: null };
    const bar = [foo];

    foo.bar = bar;

    const result = encode(bar) as typeof bar;

    expect(result).not.toBe(bar);
    expect(result[0]).not.toBe(foo);
    expect(result[0]).toEqual(foo);
    expect(result[0].bar).toBe(result);
    expect(result[0]).toBe(result[0].bar[0]);
  });

  it("Returns a proxy payload when the value is a proxy", () => {
    const proxy = nexo.create();
    const payload = getProxyPayload(proxy);

    const data = {
      proxy,
      items: [1, 2, proxy],
      foo: {
        bar: {
          proxy,
        },
      },
    };

    const result = encode(data) as typeof data;

    expect(result.proxy).toBe(payload);
    expect(result.proxy).not.toBe(proxy);
    expect(result.items[2]).toBe(payload);
    expect(result.items[2]).not.toBe(proxy);
    expect(result.foo.bar.proxy).toBe(payload);
    expect(result.foo.bar.proxy).not.toBe(proxy);
  });

  it("Can transform the value when it is neither array nor plain object", () => {
    const proxy = nexo.create();

    const data = {
      proxy,
      map: new Map(),
      bar: () => {},
    };

    const transform = (value: unknown, isProxyPayload: boolean) => {
      if (isProxyPayload) {
        return "foo";
      }

      if (typeof value === "function") {
        return null;
      }

      return "bar";
    };

    const result = encode(data, transform) as typeof data;

    expect(result.proxy).toBe("foo");
    expect(result.map).toBe("bar");
    expect(result.bar).toBe(null);
  });
});
