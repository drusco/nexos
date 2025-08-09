import type * as nx from "../types/Nexo.js";
import NexoEmitter from "../utils/NexoEmitter.js";
import NexoEvent from "../events/NexoEvent.js";

interface TestEvents extends nx.NexoEmitterEvents {
  customError: Error;
  test: nx.NexoEvent;
}

describe("NexoEmitter", () => {
  let emitter: NexoEmitter<TestEvents>;

  beforeEach(() => {
    emitter = new NexoEmitter<TestEvents>();
  });

  it("should emit an error when a listener throws", () => {
    const errorMessage = "something went wrong";
    const errorListener = jest.fn();

    emitter.on("error", errorListener);
    emitter.on("test", () => {
      throw new Error(errorMessage);
    });

    emitter.emit("test", new NexoEvent("test"));

    const [error]: [Error] = errorListener.mock.lastCall;

    expect(errorListener).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(errorMessage);
  });

  it("should unregister a listener correctly", () => {
    const listener = jest.fn();

    emitter.on("test", listener);
    emitter.off("test", listener);
    emitter.emit("test", new NexoEvent("test"));

    expect(listener).not.toHaveBeenCalled();
  });

  it("should re-emit error-like arguments from other events", () => {
    const error = new Error("oops");
    const listener = jest.fn();

    emitter.on("customError", listener);
    emitter.on("error", listener);
    emitter.emit("customError", error);

    const [customError]: [Error] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(customError).toBe(error);
  });

  it("should throw if an error occurs and no error listener is registered", () => {
    emitter.on("test", () => {
      throw new Error("Unhandled failure");
    });

    expect(() => {
      emitter.emit("test", new NexoEvent("fail"));
    }).toThrow("Unhandled failure");
  });

  it("should emit NexoEvent with custom data", () => {
    const event = new NexoEvent("test", { data: "bar" });
    const listener = jest.fn();

    emitter.on("test", listener);
    emitter.emit("test", event);

    const [nexoEvent]: [nx.NexoEvent] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(nexoEvent).toBeInstanceOf(NexoEvent);
    expect(nexoEvent.name).toBe("test");
    expect(nexoEvent.data).toEqual("bar");
  });

  it("should prevent default and set return value on the event", () => {
    const returnValue = Symbol("result");
    const event = new NexoEvent("test", { cancelable: true });

    emitter.on("test", (e: nx.NexoEvent) => {
      e.preventDefault();
      return returnValue;
    });

    emitter.emit("test", event);

    expect(event.defaultPrevented).toBe(true);
    expect(event.returnValue).toBe(returnValue);
  });

  it("should ignore preventDefault if event is not cancelable", () => {
    const event = new NexoEvent("test");

    emitter.on("test", (event) => {
      event.preventDefault();
    });

    emitter.emit("test", event);

    expect(event.defaultPrevented).toBe(false);
  });
});
