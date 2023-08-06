import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(method) isRevoked", () => {
  it("Returns a boolean indicating whether a proxy is revoked or not", () => {
    const proxy = $.use();
    const inner = proxy.inner;

    $.revoke(proxy);

    expect($.isRevoked(proxy)).toBe(true);
    expect($.isRevoked(inner)).toBe(false);
  });
});
