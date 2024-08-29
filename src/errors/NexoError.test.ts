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
    const errorListener = jest.fn();
    const target = [];

    emitter.on("error", errorListener);

    const error = new NexoError("foo", target, emitter);
    const [errorEvent] = errorListener.mock.lastCall;

    expect(errorListener).toHaveBeenCalledTimes(1);
    expect(errorEvent).toBeInstanceOf(NexoEvent);
    expect(errorEvent.data).toBe(error);
    expect(errorEvent.target).toBe(target);
    expect(errorEvent.name).toBe("error");
  });
});
