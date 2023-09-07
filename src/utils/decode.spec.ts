import Emulator from "../Emulator.js";
import encode from "./encode.js";
import decode from "./decode.js";
import constants from "./constants.js";
const $ = new Emulator();

describe("(function) decode", () => {
  it("Returns the original proxy from an encoded string", () => {
    const proxy = $.use();
    const encoded = encode(proxy);
    const decoded = decode($, encoded);

    expect(encoded).toEqual(`${constants.NO_BREAK}1`);
    expect(decoded).toBe(proxy);
  });

  it("Returns the same input when the value is not traceable", () => {
    const untraceable = null;
    const result = decode($, untraceable);

    expect(result).toEqual(untraceable);
  });

  it("Returns the same input when the value is a function", () => {
    const traceable = () => {};
    const result = decode($, traceable);

    expect(result).toBe(traceable);
  });

  it("Returns a shallow copy when de encoded value is traceable", () => {
    const proxy = $.use();
    const group = {
      proxy,
      deep: [1, 2, 3, proxy],
      deeper: {
        object: {
          reference: {
            new: $.use(),
          },
        },
      },
    };
    const encoded = encode(group);
    const decoded = decode($, group);

    expect(encoded.proxy).not.toBe(group.proxy);
    expect(decoded).toEqual(group);
  });
});
