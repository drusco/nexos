import { describe, it, expect } from "@jest/globals";
import Emulator from "./Emulator";

const $ = new Emulator();

describe("Proxy", () => {
  describe("Get, Set and Delete traps", () => {
    it("Can get values from a proxy", () => {
      const proxy = $.use();
      const deep = { test: true };

      proxy.number = 100;
      proxy.null = null;
      proxy.boolean = true;
      proxy.undefined = undefined;
      proxy.object = { test: true };
      proxy.array = ["test", $.use()];
      proxy.string = "test";
      proxy.function = () => "test";

      proxy.object.boolean = false;
      proxy.object.sub = {};
      proxy.object.sub.deep = deep;

      proxy.toDelete = true;
      delete proxy.toDelete;

      expect(typeof proxy.unknown).toBe("function");
      expect($.target(proxy.number)).toBe(100);
      expect($.target(proxy.null)).toBe(null);
      expect($.target(proxy.boolean)).toBe(true);
      expect($.target(proxy.undefined)).toBeUndefined();
      expect(typeof proxy.object).toBe("function");
      expect(typeof proxy.array).toBe("function");
      expect($.target(proxy.string)).toBe("test");
      expect($.target(proxy.function())).toBe("test");
      expect($.target(proxy.object.boolean)).toBe(false);
      expect(typeof proxy.object.sub).toBe("function");
      expect(proxy.object.sub.deep).toBe($.use(deep));
      expect($.target(proxy.object.sub.deep.test)).toBe(true);
      expect($.target(proxy.toDelete)).toBeUndefined();
    });

    it("Adds a value to the original target", () => {
      const proxy = $.use();
      const deep = { test: true, prox: true };

      proxy.set = { object: true };
      proxy.set.sub = {};
      proxy.set.sub.deep = deep;
      proxy.set.sub.deep.test = false;
      $.use(deep).test = null;
      $.use(deep).prox = $.use("test");

      expect(deep.test).toBe(null);
      expect($.target($.use(deep).test)).toBe(null);
      expect(deep.prox).toBe("test");
    });

    it("Can delete a property from a proxy and its original target", () => {
      const proxy = $.use({});
      const deep = { deep: true, property: "test" };

      proxy.set = { test: true };
      proxy.set.sub = {};
      proxy.set.sub.deep = deep;

      delete proxy.set.sub.deep.property;
      delete proxy.set;

      expect(deep.property).toBeUndefined();
      expect($.target(proxy.set)).toBeUndefined();
    });
  });

  describe("Construct and Apply traps", () => {
    it("Can construct an object and return its proxy", () => {
      class Test {
        property: number = 45;
        traceable: number[] = [55];
        inner: boolean;
        value: any;
        method(param: any) {
          this.inner = true;
          this.value = param;
        }
      }
      const TestClassProxy = $.use();
      const instance = new TestClassProxy(1, [2, 3], null);
      const value = instance.call();
      const test = $.use(new Test());
      const param = { param: true };

      test.method(param);
      instance.property = true;

      expect(typeof instance).toBe("function");
      expect(typeof value).toBe("function");
      expect(typeof test.unknown).toBe("function");
      expect($.target(instance.property)).toBe(true);
      expect($.target(test.property)).toBe(45);
      expect($.target(test.traceable[0])).toBe(55);
      expect($.target(test.inner)).toBe(true);
      expect(test.value).toBe($.use(param));
    });

    it("Gets a proxy from an apply trap when target is not a function", () => {
      const proxy = $.use();
      expect(typeof proxy()).toBe("function");
    });

    it("Gets a value from an apply trap when target is a function", () => {
      const proxy = $.use((value: number) => value / 2);
      expect($.target(proxy(10))).toBe(5);
    });
  });
});
