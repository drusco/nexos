import Emulator from "./Emulator";

const $ = new Emulator();

describe("(lib) Emulator", () => {
  it("Can simulate a browser window's context", () => {
    const window = $.useRef("window", global);

    (function component($: any) {
      $.use(() => {
        const width = window.width;
        console.log(width * 50);
      });

      expect(this).toBe(window);
    }).call(window, $);
  });
});
