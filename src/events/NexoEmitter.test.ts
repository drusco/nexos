import NexoEmitter from "../events/NexoEmitter.js";
import NexoEvent from "./NexoEvent.js";

describe("NexoEmitter", () => {
  it("Emits an error event", () => {
    const nexoEmitter = new NexoEmitter();
    const errorMessage = "something went wrong";
    const errorListener = jest.fn();

    nexoEmitter.on("error", errorListener);

    nexoEmitter.on("test", () => {
      throw Error(errorMessage);
    });

    nexoEmitter.emit("test", new NexoEvent("test"));

    const [errorEvent] = errorListener.mock.lastCall;

    expect(errorListener).toHaveBeenCalledTimes(1);
    expect(errorEvent).toBeInstanceOf(Error);
    expect(errorEvent.message).toBe(errorMessage);
  });

  it("Re-emits events that use error as first arguments to the 'error' listeners", () => {
    const nexoEmitter = new NexoEmitter();
    const customError = new Error("oops");
    const errorListener = jest.fn();

    nexoEmitter.on("customError", errorListener);
    nexoEmitter.on("error", errorListener);

    nexoEmitter.emit("customError", customError);

    const [error] = errorListener.mock.lastCall;

    expect(errorListener).toHaveBeenCalledTimes(2);
    expect(error).toBe(customError);
  });

  it("Emits NexoEvent with optional arguments", () => {
    const nexoEmitter = new NexoEmitter();
    const nexoEvent = new NexoEvent("test");
    const listener = jest.fn();

    nexoEmitter.on("test", listener);
    nexoEmitter.on("test", listener);

    nexoEmitter.emit("test", nexoEvent, 1, 2, 3);

    const [event, ...args]: [NexoEvent, ...unknown[]] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(2);
    expect(event).toBe(nexoEvent);
    expect(event.name).toBe("test");
    expect(args).toStrictEqual([1, 2, 3]);
  });

  it("Prevents default behaviors and exposes listener return values to the event", () => {
    const nexoEmitter = new NexoEmitter();
    const nexoEvent = new NexoEvent("test", { cancelable: true });
    const returnValue = new Object();

    nexoEmitter.on("test", (event: NexoEvent) => {
      event.preventDefault();
      return returnValue;
    });

    nexoEmitter.emit("test", nexoEvent);

    expect(nexoEvent.returnValue).toBe(returnValue);
    expect(nexoEvent.defaultPrevented).toBe(true);
  });
});
