import Emulator from "../Emulator";
import createProxy from "./createProxy";

const scope = new Emulator();

describe("(function) createProxy", () => {
  it("Requires a scope parameter that represents the emulator instance", () => {
    const proxy = createProxy(scope);
    expect(typeof proxy).toBe("function");
  });
});
