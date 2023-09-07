import Emulator from "../Emulator.js";
import { map } from "../utils/index.js";

describe("(constructor)", () => {
  it("Creates a new emulator", () => {
    const config = {
      traceErrors: false,
      stackTraceLimit: 3,
    };
    const emulator = new Emulator(config);
    const data: Record<string, any> = map.emulators.get(emulator) || {};
    const dataProps = ["options", "links", "counter", "proxySet"];
    const { options, links, counter } = data;

    expect(map.emulators.has(emulator)).toBe(true);
    expect(Object.keys(data)).toEqual(dataProps);
    expect(options).toEqual(config);
    expect(Object.keys(links).length).toBe(0);
    expect(Error.stackTraceLimit).toBe(config.stackTraceLimit);
    expect(counter).toBe(0);
  });
});
