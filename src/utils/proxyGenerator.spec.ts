import Emulator from "../Emulator";
import proxyGenerator from "./proxyGenerator";

const $ = new Emulator();

const proxyA = $.use();
const proxyB = $.use();
const proxyC = $.use();

describe("(function*) proxyGenerator", () => {
  it("Returns an IterableIterator of all non-revoked proxies in the emulator instance", () => {
    const iterator = proxyGenerator($);

    expect(iterator.next().value).toBe(proxyA);
    expect(iterator.next().value).toBe(proxyB);
    expect(iterator.next().value).toBe(proxyC);
    expect(iterator.next().done).toBe(true);
  });

  it("Returns an IterableIterator of all non-revoked proxies in the emulator instance in reverse order", () => {
    const iterator = proxyGenerator($, undefined, true);

    expect(iterator.next().value).toBe(proxyC);
    expect(iterator.next().value).toBe(proxyB);
    expect(iterator.next().value).toBe(proxyA);
    expect(iterator.next().done).toBe(true);
  });

  it("Returns an IterableIterator of all non-revoked proxies in the emulator instance starting from an specific proxy in time", () => {
    const iterator = proxyGenerator($, proxyB);

    expect(iterator.next().value).toBe(proxyB);
    expect(iterator.next().value).toBe(proxyC);
    expect(iterator.next().done).toBe(true);
  });

  it("Returns an IterableIterator of all non-revoked proxies in the emulator instance starting from an specific proxy in time backwards", () => {
    const iterator = proxyGenerator($, proxyB, true);

    expect(iterator.next().value).toBe(proxyB);
    expect(iterator.next().value).toBe(proxyA);
    expect(iterator.next().done).toBe(true);
  });
});
