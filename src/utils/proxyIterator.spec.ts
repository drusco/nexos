import Emulator from "../Emulator.js";
import proxyIterator from "./proxyIterator.js";

const $ = new Emulator();

const proxyA = $.use();
const proxyB = $.use();
const proxyC = $.use();

describe("(function*) proxyIterator", () => {
  it("Returns an IterableIterator of all non-revoked proxies in the emulator instance", () => {
    const iterator = proxyIterator($);

    expect(iterator.next().value).toBe(proxyA);
    expect(iterator.next().value).toBe(proxyB);
    expect(iterator.next().value).toBe(proxyC);
    expect(iterator.next().done).toBe(true);
  });
});
