import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(method) revokeAll", () => {
  it("Revokes all proxies from the instance", () => {
    const revocables = 10;

    for (let i = 0; i < revocables; i++) {
      $.use();
    }

    $.revokeAll();

    expect($.length).toBe(revocables);
    expect($.revoked).toBe(revocables);
    expect($.active).toBe(0);
  });
});
