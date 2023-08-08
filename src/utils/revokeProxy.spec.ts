import Emulator from "../Emulator";
import revokeProxy from "./revokeProxy";

const $ = new Emulator();

describe("(function) revokeProxy", () => {
  it("Returns false when the parameter is not a proxy", () => {
    const param = [100];
    const isrevoked = revokeProxy($, param);

    expect(isrevoked).toBe(false);
  });

  it("Returns true when the parameter is a proxy", () => {
    const proxy = $.use();
    const isrevoked = revokeProxy($, proxy);

    expect(isrevoked).toBe(true);
    expect(proxy).toThrow();
  });

  it("Returns true when the parameter is a proxy's target", () => {
    const target = {};
    const proxy = $.use(target);
    const isrevoked = revokeProxy($, target);

    expect(isrevoked).toBe(true);
    expect(proxy).toThrow();
  });
});
