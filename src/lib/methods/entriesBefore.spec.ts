import Emulator from "../../Emulator";
const $ = new Emulator();

describe("(method) entriesBefore", () => {
  it("Returns an iterator that contains the active proxies created before a certain proxy", () => {
    const activeProxies = $.active;
    const proxy = $.use();

    expect([...$.entriesBefore(proxy)].length).toBe(activeProxies);
  });
});
