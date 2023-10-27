import Emulator from "../Emulator.js";
import findProxy from "./findProxy.js";

const $ = new Emulator();

describe("(function) findProxy", () => {
  it("Returns undefined when a proxy is not found", () => {
    const param = ["notProxy_notTarget"];
    const proxy = findProxy(param);

    expect(proxy).toBeUndefined();
  });

  it("Returns the same proxy if the search parameter is a proxy", () => {
    const param = $.use();
    const proxy = findProxy(param);

    expect(proxy).not.toBeUndefined();
    expect(typeof proxy).toBe("function");
    expect(proxy).toBe(param);
  });

  it("Finds a proxy by target reference", () => {
    const target = [];
    const proxy = $.use(target);
    const search = findProxy(target);

    expect(search).toBe(proxy);
  });
});
