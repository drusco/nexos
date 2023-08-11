import Emulator from "./Emulator";

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

describe("(lib) Emulator", () => {
  it("Can simulate a browser window's context", async () => {
    expect(window).toBeTruthy();
  });
});
