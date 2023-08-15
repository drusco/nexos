import Emulator from "../Emulator";
import encode from "./encode";

const $ = new Emulator();

describe("(function) encode", () => {
  it("Returns a payload object from a proxy", () => {
    const proxy = $.use();
    const payload = encode(proxy);

    expect(payload).toEqual(["⁠", 1]);
  });

  it("Returns a payload object from a non proxy value", () => {
    const value = null;
    const payload = encode(value);

    expect(payload).toEqual(null);
  });
});
