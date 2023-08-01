import { describe, it, expect } from "@jest/globals";
import Emulator from "./Emulator";

const $ = new Emulator();

describe("Emulator", () => {
  describe("Methods", () => {
    describe("proxy", () => {
      it(`Returns a proxy function`, () => {
        expect(typeof $.proxy({})).toBe("function");
        expect(typeof $.proxy([])).toBe("function");
        expect(typeof $.proxy(() => {})).toBe("function");
        expect(typeof $.proxy(async () => {})).toBe("function");
        expect(typeof $.proxy("string")).toBe("function");
        expect(typeof $.proxy(undefined)).toBe("function");
        expect(typeof $.proxy(true)).toBe("function");
        expect(typeof $.proxy(false)).toBe("function");
        expect(typeof $.proxy(null)).toBe("function");
        expect(typeof $.proxy(NaN)).toBe("function");
        expect(typeof $.proxy(Infinity)).toBe("function");
        expect(typeof $.proxy(100)).toBe("function");
        expect(typeof $.proxy(Symbol("sym"))).toBe("function");
        expect(typeof $.proxy(new Date())).toBe("function");
        expect(typeof $.proxy($)).toBe("function");
        expect(typeof $.proxy($.proxy())).toBe("function");
      });

      it("Creates unique proxies when targets are not objects", () => {
        const proxyA = $.proxy("");
        const proxyB = $.proxy("");
        expect(proxyA).not.toBe(proxyB);
      });

      it("Can be referenced by an object", () => {
        const reference = { test: true };
        const proxy = $.proxy(reference);
        expect(proxy).toBe($.proxy(reference));
        expect($.target(proxy.test)).toBe(true);
      });

      it("Returns a proxy function for undefined properties", () => {
        const reference = {};
        const proxy = $.proxy(reference);
        expect(typeof proxy.test).toBe("function");
      });

      it("Can be referenced by an array object", () => {
        const reference = [1, 2, 3, $.proxy(), {}];
        const arrayProxy = $.proxy(reference);

        arrayProxy.push("test");

        expect($.target(arrayProxy[0])).toBe(1);
        expect($.target(arrayProxy[1])).toBe(2);
        expect($.target(arrayProxy[2])).toBe(3);
        expect(arrayProxy[3]).toBe(reference[3]);
        expect($.target(arrayProxy[$.target(arrayProxy.length) - 1])).toBe(
          "test",
        );
        expect(typeof arrayProxy[reference.length - 1]).toBe("function");

        expect(reference.length).toBe(6);
        expect(reference[reference.length]).toBe(undefined); // does not change the target

        expect($.target(arrayProxy.length)).toBe(reference.length);
        expect($.target(arrayProxy.pop())).toBe("test");
      });
    });

    describe("target", () => {
      it("Returns the target used by a proxy", () => {
        const target = "$%&Test";
        const proxy = $.proxy(target);
        const targetFromProxy = $.target(proxy);
        expect(target).toBe(targetFromProxy);
      });

      it("Gets the target from an apply call on the original target", () => {
        const target = "abc";
        const proxy = $.proxy(target);
        const proxy2 = proxy.substring(1);
        expect(typeof proxy2).toBe("function");
        expect($.target(proxy2)).toBe("bc");
      });
    });

    describe("bind", () => {
      it("Can be accessed through a string namespace", () => {
        const namespace = "test";
        const proxy = $.bind(namespace);
        expect(proxy).toBe($.bind(namespace));
      });
    });

    describe("revoke", () => {
      it("Turns a proxy unusable", () => {
        const proxy = $.proxy();
        $.revoke(proxy);
        expect(proxy).toThrow();
        expect(() => proxy.property).toThrow();
        expect(() => (proxy.property = true)).toThrow();
        expect(() => delete proxy.property).toThrow();
        expect(() => new proxy().toThrow());
        expect(() => proxy.method()).toThrow();
      });
    });

    describe("destroy", () => {
      it("Destroys the $ and turns it unusable", () => {
        const $ = new Emulator();
        $.destroy();
        expect($.proxy).toThrow();
        expect($.bind).toThrow();
      });
    });

    describe("count", () => {
      it("Returns the number of proxies in the $", () => {
        const current = $.count();
        $.proxy();
        expect($.count()).toBe(current + 1);
      });
    });

    describe("groups", () => {
      it("Returns the number of namespaces in the $", () => {
        const current = $.groups();
        $.bind(`${Date.now()}`);
        expect($.groups()).toBe(current + 1);
      });
    });

    describe("encode", () => {
      it("Encodes a proxy synchronously", () => {
        const proxy = $.proxy();
        expect(typeof proxy).toBe("function");
        expect(typeof $.encode(proxy)).toBe("object");
      });

      it("Encodes multiple proxies deeply", () => {
        let times = 1000;
        const map: unknown[] = [];

        while (times) {
          map.push($.proxy());
          times -= 1;
        }

        const encoded: any = $.encode(map);
        expect(typeof encoded[999]).toBe("object");
      });
    });
  });
});

describe("Proxy", () => {
  describe("Get, Set and Delete traps", () => {
    it("Can get values from a proxy", () => {
      const proxy = $.proxy();
      const deep = { test: true };

      proxy.number = 100;
      proxy.null = null;
      proxy.boolean = true;
      proxy.undefined = undefined;
      proxy.object = { test: true };
      proxy.array = ["test", $.proxy()];
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
      expect($.target(proxy.undefined)).toBe(undefined);
      expect(typeof proxy.object).toBe("function");
      expect(typeof proxy.array).toBe("function");
      expect($.target(proxy.string)).toBe("test");
      expect($.target(proxy.function())).toBe("test");
      expect($.target(proxy.object.boolean)).toBe(false);
      expect(typeof proxy.object.sub).toBe("function");
      expect(proxy.object.sub.deep).toBe($.proxy(deep));
      expect($.target(proxy.object.sub.deep.test)).toBe(true);
      expect($.target(proxy.toDelete)).toBe(undefined);
    });

    it("Adds a value to the original target", () => {
      const proxy = $.proxy();
      const deep = { test: true, prox: true };

      proxy.set = { object: true };
      proxy.set.sub = {};
      proxy.set.sub.deep = deep;
      proxy.set.sub.deep.test = false;
      $.proxy(deep).test = null;
      $.proxy(deep).prox = $.proxy("test");

      expect(deep.test).toBe(null);
      expect($.target($.proxy(deep).test)).toBe(null);
      expect(deep.prox).toBe("test");
    });

    it("Can delete a property from a proxy and its original target", () => {
      const proxy = $.proxy({});
      const deep = { deep: true, property: "test" };

      proxy.set = { test: true };
      proxy.set.sub = {};
      proxy.set.sub.deep = deep;

      delete proxy.set.sub.deep.property;
      delete proxy.set;

      expect(deep.property).toBe(undefined);
      expect($.target(proxy.set)).toBe(undefined);
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
      const TestClassProxy = $.proxy();
      const instance = new TestClassProxy(1, [2, 3], null);
      const value = instance.call();
      const test = $.proxy(new Test());
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
      expect(test.value).toBe($.proxy(param));
    });

    it("Gets a proxy from an apply trap when target is not a function", () => {
      const proxy = $.proxy();
      expect(typeof proxy()).toBe("function");
    });

    it("Gets a value from an apply trap when target is a function", () => {
      const proxy = $.proxy((value: number) => value / 2);
      expect($.target(proxy(10))).toBe(5);
    });
  });
});
