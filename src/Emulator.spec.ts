import { describe, it, expect } from "@jest/globals";
import Emulator from "./Emulator";
import assert from "assert";
//import EmulatorNS from "../src/Emulator.js";

const emulator = new Emulator({});
const emulator2 = new Emulator({});

describe("Emulator", () => {
  describe("methods", () => {
    describe("#use()", () => {
      it(`Returns a proxy function when parameter(s) type is object | string | function | undefined`, () => {
        assert.strictEqual(typeof emulator.use({}), "function");
        assert.strictEqual(typeof emulator.use([]), "function");
        expect(typeof emulator.use("test")).toStrictEqual("function");
        assert.strictEqual(typeof emulator.use(() => {}), "function");
        assert.strictEqual(typeof emulator.use(), "function");
      });

      it("Can be referenced by a string identifier", function () {
        const id = "";
        const proxy = emulator.use(id);
        assert.strictEqual(proxy, emulator.use(id));
      });

      it("Can be referenced by an object", function () {
        const object = { external: true };
        const proxy = emulator.use(object);
        assert.strictEqual(emulator.use(object), proxy);
        assert.strictEqual(proxy.external, true);
      });

      it("can be based on an external array", function () {
        const array = [1, 2, 3, emulator.use(), {}];
        const fakeArray = emulator.use(array);

        fakeArray.push("cool");

        assert.strictEqual(fakeArray[0], 1);
        assert.strictEqual(array[3], fakeArray[3]);
        assert.strictEqual(array.length, 5);
        assert.strictEqual(fakeArray[array.length], "cool");
        assert.strictEqual(array[array.length], undefined);
        assert.strictEqual(
          Emulator.equal(array[array.length - 1], fakeArray[array.length - 1]),
          true,
        );
        assert.strictEqual(emulator.exists(fakeArray[array.length - 1]), true);
        assert.strictEqual(fakeArray.length, array.length + 1);

        assert.strictEqual(array[3], fakeArray[3]);
      });

      it("exists within instance", function () {
        assert.strictEqual(emulator.used(emulator.use()), true);
      });

      it("exists within instance if searched by id", function () {
        const id = "id-123";
        emulator.use(id);
        assert.strictEqual(emulator.used(id), true);
      });

      it("exists within instance if searched by object", function () {
        const object = { external: true };
        const proxy = emulator.use(object);
        assert.strictEqual(emulator.used(proxy), true);
        assert.strictEqual(emulator.used(object), true);
      });
    });

    describe("#revoke()", function () {
      it("revoke a single proxy", function () {
        const proxy = emulator.use();
        emulator.revoke(proxy);
        assert.throws(proxy);
      });

      it("revoke multiple proxies", function () {
        const proxy = emulator.use();
        const proxy2 = emulator.use();
        emulator.revoke(proxy, proxy2);
        assert.throws(proxy);
        assert.throws(proxy2);
      });
    });

    describe("#destroy()", function () {
      it("can destroy the emulator and turn it unusable", function () {
        emulator2.destroy();
        let error;
        try {
          emulator2.use();
        } catch (e) {
          error = e;
        }
        assert.strictEqual(error instanceof Error, true);
      });
    });

    describe("#count()", function () {
      it("returns total proxies in map", function () {
        const current = emulator.count();
        const expected = current + 3;

        emulator.use();
        emulator.use("b");
        emulator.use("c");

        assert.strictEqual(emulator.count(), expected);
      });
    });

    describe("#groups()", function () {
      it("returns total groups in map", function () {
        const current = emulator.groups();
        const expected = current + 2;

        emulator.use();
        emulator.use("group-b-2");
        emulator.use("group-c-2");

        assert.strictEqual(emulator.groups(), expected);
      });
    });

    describe("#equal()", function () {
      it("compares proxies and targets", function () {
        const original1 = { unique: true };
        const original2 = { external: true };

        const a = emulator.use();
        const b = emulator.use(original1);
        const c = emulator.use(original2);

        assert.strictEqual(Emulator.equal(original1, b), true);
        assert.strictEqual(Emulator.equal(b, original1), true);
        assert.strictEqual(Emulator.equal(original1, original2), false);
        assert.strictEqual(Emulator.equal(a, b), false);
        assert.strictEqual(Emulator.equal(a, c), false);
        assert.strictEqual(Emulator.equal(b, c), false);
      });
    });

    describe("#exist()", function () {
      it("checks if value is group, proxy or target", function () {
        const target = { external: "yes" };
        emulator.use(target);
        const group = "my-group-id-456";
        const proxyGroup = emulator.use(group);

        assert.strictEqual(emulator.used(group), true);
        assert.strictEqual(emulator.used(target), true);
        assert.strictEqual(emulator.used(proxyGroup), true);

        assert.strictEqual(emulator.used(null), false);
        assert.strictEqual(emulator.used("unknown-value-aa"), false);
        assert.strictEqual(emulator.used(132), false);
        assert.strictEqual(emulator.used({}), false);
      });
    });

    describe("#encode()", function () {
      it("encodes a proxy synchronously", function () {
        const proxy = emulator.use();

        assert.strictEqual(typeof proxy, "function");
        assert.strictEqual(typeof emulator.encode(proxy), "object");
      });

      it("encodes multiple proxies", function () {
        let times = 1000;
        const obj = {};

        while (times) {
          obj[times] = emulator.use();
          times--;
        }

        assert.strictEqual(typeof obj[1], "function");

        const encoded = emulator.encode(obj);

        assert.strictEqual(typeof encoded[1], "object");
      });
    });
  });

  describe("proxy", function () {
    describe("get, set, deleteProperty", function () {
      it("can set and get values on a proxy", function () {
        const a = emulator.use();

        a.set = null;
        a.set1 = undefined;
        a.set2 = { object: true };
        a.set3 = "string";
        a.set4 = function () {
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

        assert.strictEqual(emulator.used(a.treatAsProxy), true);
        assert.strictEqual(a.set, null);
        assert.strictEqual(a.set1, undefined);
        assert.strictEqual(a.set3, "string");
        assert.strictEqual(a.set6, true);
        assert.strictEqual(a.set7, 12.2);
        assert.strictEqual(a.set8, 45);
        assert.strictEqual(a.set2.sub, false);
        assert.strictEqual(Emulator.equal(deep, a.set2.sub2.deep), true);
      });

      it("will not set a value to the original target", function () {
        const a = emulator.use();
        const deep = { deep: true, property: undefined };

        a.set2 = { object: true };

        a.set2.sub = false;
        a.set2.sub2 = {};
        a.set2.sub2.deep = deep;

        a.set2.sub2.deep.property = "hello world";

        assert.strictEqual(deep.property, undefined);
        assert.notStrictEqual(a.set2.sub2.deep, deep);
        assert.strictEqual(Emulator.equal(a.set2.sub2.deep, deep), true);

        const deep2 = emulator.use(a.set2.sub2.deep);

        // proxy out of proxy is not allowed
        assert.strictEqual(deep2, a.set2.sub2.deep);

        const abc = emulator.use({ property: true });

        a.set2.sub2.deep.setProxy = abc;

        assert.strictEqual(abc.property, a.set2.sub2.deep.setProxy.property);
      });

      it("can delete a property from a proxy and its original target", function () {
        const a = emulator.use();
        const deep = { deep: true, property: undefined };

        a.set2 = { object: true };

        a.set2.sub = false;
        a.set2.sub2 = {};
        a.set2.sub2.deep = deep;

        delete a.set2.sub2.deep.property;

        assert.strictEqual(deep.property, undefined);

        delete a.set2;

        assert.strictEqual(a.set2, undefined);
      });
    });

    describe("construct, apply", function () {
      it("can construct an object and return its proxy", function () {
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

        assert.strictEqual(instance.property, true);
        assert.strictEqual(emulator.used(value), true);

        const res = emulator.use(new MyClass());

        assert.strictEqual(res.property, 45);
        assert.strictEqual(res.traceable[0], 55);
        assert.strictEqual(emulator.used(res.unknown), true);

        const param = { param: true };

        res.method(param);

        assert.strictEqual(res.inner, true);
        assert.strictEqual(Emulator.equal(res.value, param), true);
      });

      it("always get a proxy from an apply trap", function () {
        const call = emulator.use();
        assert.strictEqual(emulator.used(call()), true);
      });
    });
  });
});
