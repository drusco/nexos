import Emulator from "../Emulator.js";
import encode from "./encode.js";
import decode from "./decode.js";
const $ = new Emulator();

describe("(function) decode", () => {
  it("Decodes proxy payloads and returns the original proxy value", () => {
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
