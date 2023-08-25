import Emulator from "./Emulator";
import Exotic from "./types/Exotic";

describe("(lib) Emulator", () => {
  it("Can simulate a browser window's context", async () => {
    const external = new Emulator();
    const browser = new Emulator();

    const win = {
      width: 1000,
      height: 600,
      test: "",
      test2: "",
      method: () => {
        return "test";
      },
    };

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

    external.addListener(
      "proxy",
      (origin: Exotic.proxy.origin, target: any) => {
        browser.include(origin, target);
      },
    );

    external.addListener("get", (values: any[], use: Exotic.FunctionLike) => {
      use(browser.decode(values).map((arg: any) => browser.target(arg)));
    });

    const window = external.useRef("window", global);
    const browserWindow = browser.useRef("window");

    window.test = "connected";
    window.test2 = window.method();
    const [width] = await external.get(window.width);

    expect(browser.target(browserWindow.test)).toBe("connected");
    expect(browser.target(browserWindow.test2)).toBe("test");
    expect(win.test).toBe("connected");
    expect(win.test2).toBe("test");
    expect(win.width).toBe(width);
  });

  it("Avoids memory allocation limits by revoking unused proxies", () => {
    const $ = new Emulator();
    const revocables = 1000000;

    for (let i = 0; i < revocables; i++) {
      $.revoke($.use());
    }

    expect($.length).toBe(0);
  });
});
