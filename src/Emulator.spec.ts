import Emulator from "./Emulator";
import Exotic from "./types/Exotic";

describe("(lib) Emulator", () => {
  it("Can simulate a browser window's context", async () => {
    const external = new Emulator();
    const browser = new Emulator();

    const win = {
      innerWidth: 1000,
      innerHeight: 600,
    };

    external.addListener(
      "proxy",
      (origin: Exotic.proxy.origin, target: any) => {
        browser.include(origin, target);
      },
    );

    browser.addListener(
      "reference",
      (ref: string, use: Exotic.FunctionLike) => {
        let value: any;
        if (ref === "window") {
          value = win;
        }
        use(value);
      },
    );

    const window = external.useRef("window", global);

    window.test = true;

    expect(browser.target(browser.useRef("window").test)).toBe(true);
    //expect(true).toBeTruthy();
  });

  it("Cannot leak memory with proper use", () => {
    const $ = new Emulator();
    const revocables = 1000000;

    for (let i = 0; i < revocables; i++) {
      $.use();
      $.revokeAll();
    }

    expect($.length).toBe(revocables);
    expect($.revoked).toBe(revocables);
    expect($.active).toBe(0);
  });
});
