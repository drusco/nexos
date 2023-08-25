import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(method) revokeAll", () => {
  it("Revokes all proxies from the instance", () => {
    const revocables = 10;
    let last: any;

    for (let i = 0; i < revocables; i++) {
      last = $.use();
    }

    $.revokeAll();

    expect($.length).toBe(0);
    expect(last).toThrow();
  });
});
