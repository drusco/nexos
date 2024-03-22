import Nexo from "../lib/Nexo.js";
import { cloneAndModify, isProxy } from "./index.js";

const nexo = new Nexo();

describe("cloneAndModify", () => {
  it("Creates a shallow copy for plain objects or arrays", () => {
    const data = {
      foo: "file",
      bar: [10, 20],
      test: true,
    };

    const result = cloneAndModify(data) as typeof data;

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

    expect(cloneAndModify(true)).toBe(true);
    expect(cloneAndModify(false)).toBe(false);
    expect(cloneAndModify(NaN)).toBe(NaN);
    expect(cloneAndModify(Infinity)).toBe(Infinity);
    expect(cloneAndModify("foo")).toBe("foo");
    expect(cloneAndModify(symbol)).toBe(symbol);
    expect(cloneAndModify(null)).toBe(null);
    expect(cloneAndModify(undefined)).toBe(undefined);
    expect(cloneAndModify(100)).toBe(100);
    expect(cloneAndModify(10.5)).toBe(10.5);
    expect(cloneAndModify(map)).toBe(map);
    expect(cloneAndModify(date)).toBe(date);
    expect(cloneAndModify(nexo)).toBe(nexo);
  });

  it("Handles circular references by using an internal cache", () => {
    const foo = { bar: null };
    const bar = [foo];

    foo.bar = bar;

    const result = cloneAndModify(bar) as typeof bar;

    expect(result).not.toBe(bar);
    expect(result[0]).not.toBe(foo);
    expect(result[0]).toEqual(foo);
    expect(result[0].bar).toBe(result);
    expect(result[0]).toBe(result[0].bar[0]);
  });

  it("Can transform the value when it is neither array nor plain object", () => {
    const proxy = nexo.create();

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

    const result = cloneAndModify(data, transform) as typeof data;

    expect(result.proxy).toBe("foo");
    expect(result.map).toBe("bar");
    expect(result.bar).toBe(null);
  });
});
