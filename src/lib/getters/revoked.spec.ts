import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(getter) revoked", () => {
  it("Returns the number of revoked proxies", () => {
    const revoked = $.revoked;
    $.revoke($.use());
    expect($.revoked).toBe(revoked + 1);
  });
});
