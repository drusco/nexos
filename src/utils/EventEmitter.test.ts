import EventEmitter from "./EventEmitter.js";
import Event from "../events/Event.js";

type TestEvents = {
  customError: (event: Error) => void;
  test: (event: nx.Event) => void;
  error: (event: Error) => void;
};

describe("EventEmitter", () => {
  let emitter: nx.EventEmitter<TestEvents>;

  beforeEach(() => {
    emitter = new EventEmitter() as nx.EventEmitter<TestEvents>;
  });

  it("should emit an error when a listener throws", () => {
    const errorMessage = "something went wrong";
    const errorListener = jest.fn();

    emitter.on("error", errorListener);
    emitter.on("test", () => {
      throw new Error(errorMessage);
    });

    expect(() => emitter.emit("test", new Event("test"))).toThrow();

    const [error]: [Error] = errorListener.mock.lastCall;

    expect(errorListener).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(errorMessage);
  });

  it("should unregister a listener correctly", () => {
    const listener = jest.fn();

    emitter.on("test", listener);
    emitter.off("test", listener);
    emitter.emit("test", new Event("test"));

    expect(listener).not.toHaveBeenCalled();
  });

  it("should re-emit error-like arguments from other events", () => {
    const oops = new Error("oops");
    const customErrorListener = jest.fn();
    const errorListener = jest.fn();

    emitter.on("customError", customErrorListener);
    emitter.on("error", errorListener);

    emitter.emit("customError", oops);

    const [customError]: [Error] = customErrorListener.mock.lastCall;
    const [error]: [Error] = errorListener.mock.lastCall;

    expect(customErrorListener).toHaveBeenCalledTimes(1);
    expect(errorListener).toHaveBeenCalledTimes(1);
    expect(customError).toBe(oops);
    expect(error).toBe(oops);
  });

  it("should emit Event with custom data", () => {
    const testEvent = new Event("test", { data: "bar" });
    const listener = jest.fn();

    emitter.on("test", listener);
    emitter.emit("test", testEvent);

    const [event]: [nx.Event] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(event).toBeInstanceOf(Event);
    expect(event.name).toBe("test");
    expect(event.data).toEqual("bar");
  });

  it("should prevent default and set return value on the event", () => {
    const returnValue = Symbol("result");
    const testEvent = new Event("test", { cancelable: true });

    emitter.on("test", (event) => {
      event.preventDefault();
      return returnValue;
    });

    emitter.emit("test", testEvent);

    expect(testEvent.defaultPrevented).toBe(true);
    expect(testEvent.returnValue).toBe(returnValue);
  });

  it("should ignore preventDefault if event is not cancelable", () => {
    const testEvent = new Event("test");

    emitter.on("test", (event) => {
      event.preventDefault();
      return "ignored";
    });

    emitter.emit("test", testEvent);

    expect(testEvent.defaultPrevented).toBe(false);
    expect(testEvent.returnValue).toBeUndefined();
  });
});
