import Emulator from "../Emulator.js";
import createProxy from "./createProxy.js";

const $ = new Emulator();

describe("(function) createProxy", () => {
  it("Returns an existing proxy", () => {
    const proxy = $.use();
    const sameProxy = createProxy($, undefined, proxy);
    expect(proxy).toBe(sameProxy);
  });

  it("Returns an existing proxy by reference key", () => {
    const refKey = "test";
    const proxy = $.link(refKey);
    const sameProxy = createProxy(
      $,
      {
        action: "link",
        key: refKey,
      },
      proxy,
    );

    expect(proxy).toBe(sameProxy);
  });

  it("Adds a new reference key", () => {
    const refKey = "test2";
    const refKeyExisted = $.links.includes(refKey);

    createProxy($, {
      action: "link",
      key: refKey,
    });

    expect(refKeyExisted).toBe(false);
    expect($.links.includes(refKey)).toBe(true);
  });

  it("Adds any target value to a proxy", () => {
    const target = "target";
    const proxy = createProxy($, undefined, target);

    expect($.target(proxy)).toBe(target);
  });
});
