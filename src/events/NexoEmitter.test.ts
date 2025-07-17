import type * as nx from "../types/Nexo.js";
import NexoEmitter from "../events/NexoEmitter.js";
import NexoEvent from "./NexoEvent.js";

describe("NexoEmitter", () => {
  it("should emit an error when a listener throws", () => {
    const emitter = new NexoEmitter();
    const errorMessage = "something went wrong";
    const errorListener = jest.fn();

    emitter.on("error", errorListener);
    emitter.on("test", () => {
      throw new Error(errorMessage);
    });

    emitter.emit("test", new NexoEvent("test"));

    expect(errorListener).toHaveBeenCalledTimes(1);

    const [error] = errorListener.mock.lastCall;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(errorMessage);
  });

  it("should unregister a listener correctly", () => {
    const emitter = new NexoEmitter();
    const listener = jest.fn();

    emitter.on("test", listener);
    emitter.off("test", listener);

    emitter.emit("test", new NexoEvent("test"));

    expect(listener).not.toHaveBeenCalled();
  });

  it("should re-emit error-like arguments from other events", () => {
    const emitter = new NexoEmitter();
    const error = new Error("oops");
    const listener = jest.fn();

    emitter.on("customError", listener);
    emitter.on("error", listener);

    emitter.emit("customError", error);

    expect(listener).toHaveBeenCalledTimes(2);

    const [lastError] = listener.mock.lastCall;
    expect(lastError).toBe(error);
  });

  it("should throw if an error occurs and no error listener is registered", () => {
    const emitter = new NexoEmitter();

    emitter.on("fail", () => {
      throw new Error("Unhandled failure");
    });

    expect(() => {
      emitter.emit("fail", new NexoEvent("fail"));
    }).toThrow("Unhandled failure");
  });

  it("should emit NexoEvent with custom data", () => {
    const emitter = new NexoEmitter();
    const event = new NexoEvent("dataEvent", { data: "bar" });
    const listener = jest.fn();

    emitter.on("dataEvent", listener);
    emitter.emit("dataEvent", event);

    expect(listener).toHaveBeenCalledTimes(1);

    const [received]: [typeof event] = listener.mock.lastCall;
    expect(received).toBeInstanceOf(NexoEvent);
    expect(received.name).toBe("dataEvent");
    expect(received.data).toEqual("bar");
  });

  it("should prevent default and set return value on the event", () => {
    const emitter = new NexoEmitter();
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
    const emitter = new NexoEmitter();
    const event = new NexoEvent("nonCancelable");

    emitter.on("nonCancelable", (e: nx.NexoEvent) => {
      e.preventDefault();
    });

    emitter.emit("nonCancelable", event);

    expect(event.defaultPrevented).toBe(false);
  });
});
