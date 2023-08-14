import Emulator from "../Emulator";
import Exotic from "../types/Exotic";
import { map } from "../utils";

describe("(constructor)", () => {
  it("Creates a new emulator", () => {
    const config: Exotic.emulator.options = {};
    const emulator = new Emulator(config);
    const data: Record<string, any> = map.emulators.get(emulator) || {};
    const dataProps = ["options", "refs", "totalProxies", "activeProxies"];
    const { options, refs, totalProxies, activeProxies } = data;

    expect(map.emulators.has(emulator)).toBe(true);
    expect(Object.keys(data)).toEqual(dataProps);
    expect(options).toBe(config);
    expect(Reflect.ownKeys(refs).length).toBe(0);
    expect(totalProxies).toBe(0);
    expect(activeProxies).toBe(0);
  });
});
