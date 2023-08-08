import Emulator from "../Emulator";
import createProxy from "./createProxy";

const $ = new Emulator();

describe("(function) createProxy", () => {
  it("Returns an existing proxy", () => {
    const proxy = $.use();
    const sameProxy = createProxy($, proxy);
    expect(proxy).toBe(sameProxy);
  });

  it("Returns an existing proxy by reference key", () => {
    const refKey = "test";
    const proxy = $.useRef(refKey);
    const sameProxy = createProxy($, proxy, undefined, refKey);

    expect(proxy).toBe(sameProxy);
  });

  it("Adds a new reference key", () => {
    const refKey = "new";
    const refKeyExisted = $.refs.includes(refKey);

    createProxy($, undefined, undefined, refKey);

    expect(refKeyExisted).toBe(false);
    expect($.refs.includes(refKey)).toBe(true);
  });

  it("Adds any target value to a proxy", () => {
    const target = "target";
    const proxy = createProxy($, target);

    expect($.target(proxy)).toBe(target);
  });
});
