import { describe, it, expect } from "@jest/globals";
import Emulator from "./Emulator";

const emulator = new Emulator();
const emulator2 = new Emulator();

describe("Emulator", () => {
  describe("methods", () => {
    describe("use", () => {
      it(`Returns a proxy function`, () => {
        expect(typeof emulator.use({})).toStrictEqual("function");
        expect(typeof emulator.use([])).toStrictEqual("function");
        expect(typeof emulator.use(() => {})).toStrictEqual("function");
        expect(typeof emulator.use(async () => {})).toStrictEqual("function");
        expect(typeof emulator.use("string")).toStrictEqual("function");
        expect(typeof emulator.use(undefined)).toStrictEqual("function");
        expect(typeof emulator.use(true)).toStrictEqual("function");
        expect(typeof emulator.use(false)).toStrictEqual("function");
        expect(typeof emulator.use(null)).toStrictEqual("function");
        expect(typeof emulator.use(NaN)).toStrictEqual("function");
        expect(typeof emulator.use(Infinity)).toStrictEqual("function");
        expect(typeof emulator.use(100)).toStrictEqual("function");
        expect(typeof emulator.use(Symbol("sym"))).toStrictEqual("function");
        expect(typeof emulator.use(new Date())).toStrictEqual("function");
        expect(typeof emulator.use(emulator)).toStrictEqual("function");
        expect(typeof emulator.use(emulator.use())).toStrictEqual("function");
      });

      it("Can be referenced by an object", () => {
        const object = { test: true };
        const proxy = emulator.use(object);
        expect(proxy).toStrictEqual(emulator.use(object));
        expect(proxy.test).toStrictEqual(true);
      });

      it("Can be based on an external array preserving the original array", () => {
        const array = [1, 2, 3, emulator.use(), {}];
        const fakeArray = emulator.use(array);

        fakeArray.push("cool");

        expect(fakeArray[0]).toStrictEqual(1);
        expect(array[3]).toStrictEqual(fakeArray[3]);
        expect(array.length).toStrictEqual(5);
        expect(fakeArray[array.length]).toStrictEqual("cool");
        expect(array[array.length]).toStrictEqual(undefined);
        expect(
          Emulator.equal(array[array.length - 1], fakeArray[array.length - 1]),
        ).toStrictEqual(true);
        expect(emulator.exists(fakeArray[array.length - 1])).toStrictEqual(
          true,
        );
        expect(fakeArray.length).toStrictEqual(array.length + 1);
        expect(array[3]).toStrictEqual(fakeArray[3]);
      });

      it("exists within instance", () => {
        expect(emulator.used(emulator.use())).toStrictEqual(true);
      });

      it("Exists within instance if searched by object", () => {
        const object = { test: true };
        const proxy = emulator.use(object);
        expect(emulator.used(proxy)).toStrictEqual(true);
        expect(emulator.used(object)).toStrictEqual(true);
      });
    });

    describe("namespace", () => {
      it("Can be accessed through a string namespace", () => {
        const namespace = "test";
        const proxy = emulator.namespace(namespace);
        expect(proxy).toStrictEqual(emulator.namespace(namespace));
      });
    });

    describe("revoke", () => {
      it("Revokes a single proxy", () => {
        const proxy = emulator.use();
        emulator.revoke(proxy);
        expect(proxy).toThrow();
      });

      it("Revokes multiple proxies", () => {
        const proxy = emulator.use();
        const proxy2 = emulator.use();
        emulator.revoke(proxy, proxy2);
        expect(proxy).toThrow();
        expect(proxy2).toThrow();
      });
    });

    describe("destroy", () => {
      it("Destroys the emulator and turn it unusable", () => {
        emulator2.destroy();
        let error: any;
        try {
          emulator2.use();
        } catch (e) {
          error = e;
        }
        expect(error instanceof Error).toStrictEqual(true);
      });
    });

    describe("count", () => {
      it("Returns total proxies in map", () => {
        const current = emulator.count();
        const expected = current + 3;

        emulator.use();
        emulator.use("b");
        emulator.use("c");

        expect(emulator.count()).toStrictEqual(expected);
      });
    });

    describe("groups", () => {
      it("Returns total namespaces in map", () => {
        const current = emulator.groups();
        const expected = current + 1;

        emulator.use();
        emulator.namespace("ns-c-2");

        expect(emulator.groups()).toStrictEqual(expected);
      });
    });

    describe("equal", () => {
      it("Compares proxies and targets", () => {
        const original1 = { unique: true };
        const original2 = { external: true };

        const a = emulator.use();
        const b = emulator.use(original1);
        const c = emulator.use(original2);

        expect(Emulator.equal(original1, b)).toStrictEqual(true);
        expect(Emulator.equal(b, original1)).toStrictEqual(true);
        expect(Emulator.equal(original1, original2)).toStrictEqual(false);
        expect(Emulator.equal(a, b)).toStrictEqual(false);
        expect(Emulator.equal(a, c)).toStrictEqual(false);
        expect(Emulator.equal(b, c)).toStrictEqual(false);
      });
    });

    describe("exist", () => {
      it("Checks if value is namespace, proxy or target", () => {
        const target = { external: "yes" };
        emulator.use(target);
        const group = "my-group-id-456";
        const proxyGroup = emulator.namespace(group);

        expect(emulator.used(group)).toStrictEqual(true);
        expect(emulator.used(target)).toStrictEqual(true);
        expect(emulator.used(proxyGroup)).toStrictEqual(true);

        expect(emulator.used(null)).toStrictEqual(false);
        expect(emulator.used("unknown-value-aa")).toStrictEqual(false);
        expect(emulator.used(132)).toStrictEqual(false);
        expect(emulator.used({})).toStrictEqual(false);
      });
    });

    describe("encode", () => {
      it("Encodes a proxy synchronously", () => {
        const proxy = emulator.use();

        expect(typeof proxy).toStrictEqual("function");
        expect(typeof emulator.encode(proxy)).toStrictEqual("object");
      });

      it("Encodes multiple proxies", () => {
        let times = 1000;
        const obj = {};

        while (times) {
          obj[times] = emulator.use();
          times--;
        }

        expect(typeof obj[1]).toStrictEqual("function");

        const encoded = emulator.encode(obj);

        expect(typeof encoded[1]).toStrictEqual("object");
      });
    });
  });

  describe("proxy", () => {
    describe("get, set, deleteProperty", () => {
      it("Can set and get values on a proxy", () => {
        const a = emulator.use();
        a.set = null;
        a.set1 = undefined;
        a.set2 = { object: true };
        a.set3 = "string";
        a.set4 = () => {
          console.log("function call");
        };
        a.set5 = [1, 2, 3];
        a.set6 = true;
        a.set7 = 12.2;
        a.set8 = 45;
        a.set9 = new Date();
        const deep = { deep: true };
        a.set2.sub = false;
        a.set2.sub2 = {};
        a.set2.sub2.deep = deep;
        expect(emulator.used(a.treatAsProxy)).toStrictEqual(true);
        expect(a.set).toStrictEqual(null);
        expect(a.set1).toStrictEqual(undefined);
        expect(a.set3).toStrictEqual("string");
        expect(a.set6).toStrictEqual(true);
        expect(a.set7).toStrictEqual(12.2);
        expect(a.set8).toStrictEqual(45);
        expect(a.set2.sub).toStrictEqual(false);
        expect(Emulator.equal(deep, a.set2.sub2.deep)).toStrictEqual(true);
      });

      it("Will not set a value to the original target", () => {
        const a = emulator.use();
        const deep = { deep: true, property: undefined };
        a.set2 = { object: true };
        a.set2.sub = false;
        a.set2.sub2 = {};
        a.set2.sub2.deep = deep;
        a.set2.sub2.deep.property = "hello world";
        expect(deep.property).toEqual(undefined);
        expect(a.set2.sub2.deep).not.toBe(deep);
        expect(Emulator.equal(a.set2.sub2.deep, deep)).toStrictEqual(true);
        const deep2 = emulator.use(a.set2.sub2.deep);
        // proxy out of proxy is not allowed
        expect(deep2).toStrictEqual(a.set2.sub2.deep);
        const abc = emulator.use({ property: true });
        a.set2.sub2.deep.setProxy = abc;
        expect(abc.property).toStrictEqual(a.set2.sub2.deep.setProxy.property);
      });

      it("Can delete a property from a proxy and its original target", () => {
        const a = emulator.use();
        const deep = { deep: true, property: undefined };
        a.set2 = { object: true };
        a.set2.sub = false;
        a.set2.sub2 = {};
        a.set2.sub2.deep = deep;
        delete a.set2.sub2.deep.property;
        expect(deep.property).toStrictEqual(undefined);
        delete a.set2;
        expect(a.set2).toStrictEqual(undefined);
      });
    });

    describe("construct, apply", () => {
      it("can construct an object and return its proxy", () => {
        function MyClass() {
          this.property = 45;
          this.traceable = [55];
          this.method = function (param) {
            this.inner = true;
            this.value = param;
          };
        }
        const Class = emulator.use({});
        const instance = new Class(1, [2, 3], null);
        instance.property = true;
        const value = instance.call(true);
        expect(instance.property).toStrictEqual(true);
        expect(emulator.used(value)).toStrictEqual(true);
        const res = emulator.use(new MyClass());
        expect(res.property).toStrictEqual(45);
        expect(res.traceable[0]).toStrictEqual(55);
        expect(emulator.used(res.unknown)).toStrictEqual(true);
        const param = { param: true };
        res.method(param);
        expect(res.inner).toStrictEqual(true);
        expect(Emulator.equal(res.value, param)).toStrictEqual(true);
      });

      it("always get a proxy from an apply trap", () => {
        const call = emulator.use();
        expect(emulator.used(call())).toStrictEqual(true);
      });
    });
  });
});
