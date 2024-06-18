import EventEmitter from "events";
import NexoProxy from "./NexoProxy.js";

describe("NexoProxy", () => {
  it("Creates a new revocable proxy with its wrapper", () => {
    const { wrapper, proxy, revoke } = NexoProxy.create();

    expect(wrapper).toBeInstanceOf(NexoProxy);
    expect(wrapper).toBeInstanceOf(EventEmitter);
    expect(typeof proxy).toBe("function");
    expect(typeof revoke).toBe("function");
  });
});
