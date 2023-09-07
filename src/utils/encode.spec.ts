import Emulator from "../Emulator.js";
import constants from "./constants.js";
import encode from "./encode.js";

const $ = new Emulator();

describe("(function) encode", () => {
  it("Returns a string that represents a proxy", () => {
    const proxy = $.use();
    const result = encode(proxy);

    expect(result).toEqual(`${constants.NO_BREAK}1`);
  });

  it("Returns the same input when the value is not traceable", () => {
    const untraceable = null;
    const result = encode(untraceable);

    expect(result).toEqual(untraceable);
  });

  it("Returns a shallow copy of the original input when the value is traceable", () => {
    const traceable = [];
    const result = encode(traceable);

    expect(result).toEqual([]);
    expect(result).not.toBe(traceable);
  });

  it("Returns the same input when the value is a function", () => {
    const traceable = () => {};
    const result = encode(traceable);

    expect(result).toBe(traceable);
  });
});
