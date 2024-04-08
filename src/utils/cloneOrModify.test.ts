import ProxyNexo from "../lib/Nexo.js";
import { cloneOrModify, isProxy } from "./index.js";

const nexo = new ProxyNexo();

describe("cloneOrModify", () => {
  it("Creates a shallow copy for plain objects or arrays", () => {
    const data = {
      foo: "file",
      bar: [10, 20],
      test: true,
    };

    const result = cloneOrModify(data) as typeof data;

    expect(result).not.toBe(data);
    expect(result.foo).toBe("file");
    expect(result.bar).toStrictEqual([10, 20]);
    expect(result.bar).not.toBe(data.bar);
    expect(result.test).toBe(true);
  });

  it("Returns the same value if it is not an array or a plain object", () => {
    const symbol = Symbol();
    const map = new Map();
    const date = new Date();

    expect(cloneOrModify(true)).toBe(true);
    expect(cloneOrModify(false)).toBe(false);
    expect(cloneOrModify(NaN)).toBe(NaN);
    expect(cloneOrModify(Infinity)).toBe(Infinity);
    expect(cloneOrModify("foo")).toBe("foo");
    expect(cloneOrModify(symbol)).toBe(symbol);
    expect(cloneOrModify(null)).toBe(null);
    expect(cloneOrModify(undefined)).toBe(undefined);
    expect(cloneOrModify(100)).toBe(100);
    expect(cloneOrModify(10.5)).toBe(10.5);
    expect(cloneOrModify(map)).toBe(map);
    expect(cloneOrModify(date)).toBe(date);
    expect(cloneOrModify(nexo)).toBe(nexo);
  });

  it("Handles circular references by using an internal cache", () => {
    const foo = { bar: null };
    const bar = [foo];

    foo.bar = bar;

    const result = cloneOrModify(bar) as typeof bar;

    expect(result).not.toBe(bar);
    expect(result[0]).not.toBe(foo);
    expect(result[0]).toStrictEqual(foo);
    expect(result[0].bar).toBe(result);
    expect(result[0]).toBe(result[0].bar[0]);
  });

  it("Can transform the value when it is neither array nor plain object", () => {
    const proxy = nexo.proxy();

    const data = {
      proxy,
      map: new Map(),
      bar: () => {},
    };

    const transform = (value: unknown) => {
      if (isProxy(value)) {
        return "foo";
      }

      if (typeof value === "function") {
        return null;
      }

      return "bar";
    };

    const result = cloneOrModify(data, transform) as typeof data;

    expect(result.proxy).toBe("foo");
    expect(result.map).toBe("bar");
    expect(result.bar).toBe(null);
  });
});
