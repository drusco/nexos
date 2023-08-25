import Emulator from "../Emulator";
import Exotic from "../types/Exotic";
import { map } from "../utils";

describe("(constructor)", () => {
  it("Creates a new emulator", () => {
    const config: Exotic.emulator.options = { traceErrors: false };
    const emulator = new Emulator(config);
    const data: Record<string, any> = map.emulators.get(emulator) || {};
    const dataProps = ["options", "refs", "counter", "proxySet"];
    const { options, refs, counter } = data;

    expect(map.emulators.has(emulator)).toBe(true);
    expect(Object.keys(data)).toEqual(dataProps);
    expect(options).toEqual(config);
    expect(Reflect.ownKeys(refs).length).toBe(0);
    expect(counter).toBe(0);
  });
});
