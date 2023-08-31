import Emulator from "../Emulator.js";
import isTraceable from "./isTraceable.js";

const $ = new Emulator();

describe("(function) isTraceable", () => {
  it("Returns true when the parameter is a non-null object or a function that is not a proxy", () => {
    // define prossible targets
    const trueTargets = [[], {}, function () {}, () => {}, function* () {}];
    const falseTargets = [
      null,
      undefined,
      "string",
      $.use(),
      10,
      NaN,
      Infinity,
      true,
      false,
      Symbol(),
    ];

    const traceable = trueTargets.every(isTraceable);
    const untraceable = falseTargets.some(isTraceable);

    expect(traceable).toBe(true);
    expect(untraceable).toBe(false);
  });
});
