import NexoEmitter from "../events/NexoEmitter.js";
import NexoError from "./NexoError.js";
import NexoEvent from "../events/NexoEvent.js";

describe("NexoError", () => {
  it("Creates a new nexo error", () => {
    const nexoError = new NexoError("foo");

    expect(nexoError.message).toBe("foo");
    expect(nexoError).toBeInstanceOf(Error);
  });

  it("Accepts a target and event emitters to emit a new error event", () => {
    const emitter = new NexoEmitter();
    const callback = jest.fn();
    const target = [];

    emitter.on("nx.error", callback);

    const error = new NexoError("foo", target, emitter);
    const [event] = callback.mock.lastCall;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(event).toBeInstanceOf(NexoEvent);
    expect(event.data).toBe(error);
    expect(event.target).toBe(target);
    expect(event.name).toBe("nx.error");
  });
});
