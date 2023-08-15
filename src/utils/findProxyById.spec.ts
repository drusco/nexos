import Emulator from "../Emulator";
import findProxyById from "./findProxyById";

describe("(function) findProxyById", () => {
  it("Gets the proxy's id number", () => {
    const $ = new Emulator();
    const expectedId = 1;
    const proxy = $.use();
    expect(findProxyById($, expectedId)).toBe(proxy);
  });

  it("Gets the proxy's id number within the same instance", () => {
    const $ = new Emulator();
    const $e = new Emulator();
    const expectedId = 1;
    const proxy = $.use();
    const proxyOnAnotherInstance = $e.use();

    expect(findProxyById($, expectedId)).toBe(proxy);
    expect(findProxyById($e, expectedId)).toBe(proxyOnAnotherInstance);
  });
});
