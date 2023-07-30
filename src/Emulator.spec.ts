import { describe, it, expect } from "@jest/globals";
import Emulator from "./Emulator";

const $ = new Emulator();

describe("Emulator", () => {
  describe("Methods", () => {
    describe("useProxy", () => {
      it(`Returns a proxy function`, () => {
        expect(typeof $.useProxy({})).toBe("function");
        expect(typeof $.useProxy([])).toBe("function");
        expect(typeof $.useProxy(() => {})).toBe("function");
        expect(typeof $.useProxy(async () => {})).toBe("function");
        expect(typeof $.useProxy("string")).toBe("function");
        expect(typeof $.useProxy(undefined)).toBe("function");
        expect(typeof $.useProxy(true)).toBe("function");
        expect(typeof $.useProxy(false)).toBe("function");
        expect(typeof $.useProxy(null)).toBe("function");
        expect(typeof $.useProxy(NaN)).toBe("function");
        expect(typeof $.useProxy(Infinity)).toBe("function");
        expect(typeof $.useProxy(100)).toBe("function");
        expect(typeof $.useProxy(Symbol("sym"))).toBe("function");
        expect(typeof $.useProxy(new Date())).toBe("function");
        expect(typeof $.useProxy($)).toBe("function");
        expect(typeof $.useProxy($.useProxy())).toBe("function");
      });

      it("Creates unique proxies when targets are not objects", () => {
        const proxyA = $.useProxy("");
        const proxyB = $.useProxy("");
        expect(proxyA).not.toBe(proxyB);
      });

      it("Can be referenced by an object", () => {
        const reference = { test: true };
        const proxy = $.useProxy(reference);
        expect(proxy).toBe($.useProxy(reference));
        expect(proxy.test).toBe(true);
      });

      it("Returns a proxy function for undefined properties", () => {
        const reference = {};
        const proxy = $.useProxy(reference);
        expect(typeof proxy.test).toBe("function");
      });

      it("Can be referenced by an array object", () => {
        const reference = [1, 2, 3, $.useProxy(), {}];
        const arrayProxy = $.useProxy(reference);

        arrayProxy.push("test");

        expect(arrayProxy[0]).toBe(1);
        expect(arrayProxy[1]).toBe(2);
        expect(arrayProxy[2]).toBe(3);
        expect(arrayProxy[3]).toBe(reference[3]);
        expect(arrayProxy[arrayProxy.length - 1]).toBe("test");
        expect(typeof arrayProxy[reference.length - 1]).toBe("function");

        expect(reference.length).toBe(5);
        expect(reference[reference.length]).toBe(undefined); // does not change the target

        expect(arrayProxy.length).toBe(reference.length + 1);
        expect($.useTarget(arrayProxy.pop())).toBe("test");
      });
    });

    describe("useTarget", () => {
      it("Returns the target used by a proxy", () => {
        const target = "$%&Test";
        const proxy = $.useProxy(target);
        const targetFromProxy = $.useTarget(proxy);
        expect(target).toBe(targetFromProxy);
      });
    });

    describe("namespace", () => {
      it("Can be accessed through a string namespace", () => {
        const namespace = "test";
        const proxy = $.namespace(namespace);
        expect(proxy).toBe($.namespace(namespace));
      });
    });

    describe("revoke", () => {
      it("Turns a proxy unusable", () => {
        const proxy = $.useProxy();
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
        expect($.useProxy).toThrow();
        expect($.namespace).toThrow();
      });
    });

    describe("count", () => {
      it("Returns the number of proxies in the $", () => {
        const current = $.count();
        $.useProxy();
        expect($.count()).toBe(current + 1);
      });
    });

    describe("groups", () => {
      it("Returns the number of namespaces in the $", () => {
        const current = $.groups();
        $.namespace(`${Date.now()}`);
        expect($.groups()).toBe(current + 1);
      });
    });

    describe("encode", () => {
      it("Encodes a proxy synchronously", () => {
        const proxy = $.useProxy();
        expect(typeof proxy).toBe("function");
        expect(typeof $.encode(proxy)).toBe("object");
      });

      it("Encodes multiple proxies deeply", () => {
        let times = 1000;
        const map: unknown[] = [];

        while (times) {
          map.push($.useProxy());
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
      const proxy = $.useProxy();
      const deep = { test: true };

      proxy.number = 100;
      proxy.null = null;
      proxy.boolean = true;
      proxy.undefined = undefined;
      proxy.object = { test: true };
      proxy.array = ["test", $.useProxy()];
      proxy.string = "test";
      proxy.function = () => "test";

      proxy.object.boolean = false;
      proxy.object.sub = {};
      proxy.object.sub.deep = deep;

      proxy.toDelete = true;
      delete proxy.toDelete;

      expect(typeof proxy.unknown).toBe("function");
      expect(proxy.number).toBe(100);
      expect(proxy.null).toBe(null);
      expect(proxy.boolean).toBe(true);
      expect(proxy.undefined).toBe(undefined);
      expect(typeof proxy.object).toBe("function");
      expect(typeof proxy.array).toBe("function");
      expect(proxy.string).toBe("test");
      expect($.useTarget(proxy.function())).toBe("test");
      expect(proxy.object.boolean).toBe(false);
      expect(typeof proxy.object.sub).toBe("function");
      expect(proxy.object.sub.deep).toBe($.useProxy(deep));
      expect(proxy.object.sub.deep.test).toBe(true);
      expect(proxy.toDelete).toBe(undefined);
    });

    it("Will not set a value to the original target", () => {
      const proxy = $.useProxy();
      const deep = { test: true };

      proxy.set = { object: true };
      proxy.set.sub = {};
      proxy.set.sub.deep = deep;
      proxy.set.sub.deep.test = false;
      $.useProxy(deep).test = null;

      expect(deep.test).toBe(true);
      expect($.useProxy(deep).test).toBe(null);
    });

    it("Can delete a property from a proxy and its original target", () => {
      const proxy = $.useProxy();
      const deep = { deep: true, property: "test" };

      proxy.set = { test: true };
      proxy.set.sub = {};
      proxy.set.sub.deep = deep;

      delete proxy.set.sub.deep.property;
      delete proxy.set;

      expect(deep.property).toBe(undefined);
      expect(proxy.set).toBe(undefined);
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
      const TestClassProxy = $.useProxy();
      const instance = new TestClassProxy(1, [2, 3], null);
      const value = instance.call();
      const test = $.useProxy(new Test());
      const param = { param: true };

      test.method(param);
      instance.property = true;

      expect(typeof instance).toBe("function");
      expect(typeof value).toBe("function");
      expect(typeof test.unknown).toBe("function");
      expect(instance.property).toBe(true);
      expect(test.property).toBe(45);
      expect(test.traceable[0]).toBe(55);
      expect(test.inner).toBe(true);
      expect(test.value).toBe($.useProxy(param));
    });

    it("Gets a proxy from an apply trap when target is not a function", () => {
      const proxy = $.useProxy();
      expect(typeof proxy()).toBe("function");
    });

    it("Gets a value from an apply trap when target is a function", () => {
      const proxy = $.useProxy((value: number) => value / 2);
      expect($.useTarget(proxy(10))).toBe(5);
    });
  });
});
