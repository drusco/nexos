import Emulator from "../Emulator";
import Exotic from "../types/Exotic";
import { map, constants } from "../utils";

describe("(constructor)", () => {
  it("Creates a new emulator", () => {
    const config: Exotic.emulator.options = constants.CONFIG;
    const emulator = new Emulator(config);
    const data: Record<string, any> = map.emulators.get(emulator) || {};
    const dataProps = ["options", "refs", "links", "counter", "proxySet"];
    const { options, refs, links, counter } = data;

    expect(map.emulators.has(emulator)).toBe(true);
    expect(Object.keys(data)).toEqual(dataProps);
    expect(options).toEqual(config);
    expect(Object.keys(refs).length).toBe(0);
    expect(Object.keys(links).length).toBe(0);
    expect(Error.stackTraceLimit).toBe(config.stackTraceLimit);
    expect(counter).toBe(0);
  });
});
