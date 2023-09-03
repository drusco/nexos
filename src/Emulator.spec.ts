import Emulator from "./Emulator.js";
import Exotic from "./types/Exotic.js";

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

    external.addListener(
      "proxy",
      (encodedProxy: string, origin: Exotic.proxy.origin, target: any) => {
        browser.include(encodedProxy, origin, target);
      },
    );

    const browserWindow = browser.link("window", win);
    const window = external.link("window");

    window.test = "connected";
    window.test2 = window.method();

    expect(browser.target(browserWindow.test)).toBe("connected");
    expect(browser.target(browserWindow.test2)).toBe("test");
    expect(win.test).toBe("connected");
    expect(win.test2).toBe("test");
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
