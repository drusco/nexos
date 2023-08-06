import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(getter) refs", () => {
  it("Returns an array of all reference keys in use", () => {
    const reference = Date.now().toString();
    $.useRef(reference);
    expect($.refs.includes(reference)).toBe(true);
  });
});
