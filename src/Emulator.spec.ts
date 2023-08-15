import Emulator from "./Emulator";

describe("(lib) Emulator", () => {
  it("Can simulate a browser window's context", async () => {
    const nodejs = new Emulator();
    const browser = new Emulator();

    const win = {
      innerWidth: 600,
      innerHeight: 1000,
    };

    // the browser's emulator sets the 'window' ref
    // with the actual window object
    browser.useRef("window", win);

    // the api informs the browser context to create a new ref 'window'
    // since the 'window' ref exists in the browser already it will use the existing proxy
    // every handler trap call on the api will correspond to the real window target in the browser
    const window = nodejs.useRef("window", global);

    expect(window).toBeTruthy();
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
