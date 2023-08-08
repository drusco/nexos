import Emulator from "../Emulator";
import getPayload from "./getPayload";

const $ = new Emulator();

describe("(function) getPayload", () => {
  it("Returns a payload object from a proxy", () => {
    const proxy = $.use();
    const payload = getPayload($, proxy);

    expect(payload).toEqual({ encoded: true, value: 1 });
  });

  it("Returns a payload object from a non proxy value", () => {
    const value = null;
    const payload = getPayload($, value);

    expect(payload).toEqual({ encoded: false, value });
  });
});
