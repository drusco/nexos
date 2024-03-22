import EventEmitter from "events";
import NexoError from "./NexoError.js";
import NexoEvent from "../events/NexoEvent.js";

describe("NexoError", () => {
  it("Creates a new nexo error", () => {
    const nexoError = new NexoError("foo");

    expect(nexoError.message).toBe("foo");
    expect(nexoError).toBeInstanceOf(Error);
  });

  it("Accepts an event emitter that will emit an error event", () => {
    const emitter = new EventEmitter();
    const callback = jest.fn();

    emitter.on("nx.error", callback);

    const error = new NexoError("foo", emitter);
    const [event] = callback.mock.lastCall;

    expect(callback).toHaveBeenCalledTimes(1);
    expect(event).toBeInstanceOf(NexoEvent);
    expect(event.data).toBe(error);
    expect(event.target).toBe(emitter);
    expect(event.name).toBe("nx.error");
  });
});
