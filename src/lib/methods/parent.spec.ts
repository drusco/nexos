import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(method) parent", () => {
  it("Access a proxy parent", () => {
    const parent = $.use();
    const child = parent.child;
    expect($.parent(child)).toBe(parent);
    expect($.parent(parent)).toBeUndefined();
  });
});
