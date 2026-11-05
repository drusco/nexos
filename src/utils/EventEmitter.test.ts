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
    emitter = new EventEmitter<TestEvents>();
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

  describe("emitAsync", () => {
    it("should await async listeners and capture the resolved return value", async () => {
      const returnValue = Symbol("async-result");
      const testEvent = new Event("test", { cancelable: true });

      emitter.on("test", async (event) => {
        await Promise.resolve();
        event.preventDefault();
        return returnValue;
      });

      await emitter.emitAsync("test", testEvent);

      expect(testEvent.defaultPrevented).toBe(true);
      expect(testEvent.returnValue).toBe(returnValue);
    });

    it("should execute async listeners in registration order", async () => {
      const order: number[] = [];

      emitter.on("test", async () => {
        order.push(1);
      });
      emitter.on("test", async () => {
        order.push(2);
      });
      emitter.on("test", async () => {
        order.push(3);
      });

      await emitter.emitAsync("test", new Event("test"));

      expect(order).toEqual([1, 2, 3]);
    });

    it("should resolve to true when listeners are triggered", async () => {
      emitter.on("test", () => undefined);

      await expect(emitter.emitAsync("test", new Event("test"))).resolves.toBe(
        true,
      );
    });

    it("should resolve to false when no listeners are registered", async () => {
      await expect(emitter.emitAsync("test", new Event("test"))).resolves.toBe(
        false,
      );
    });

    it("should re-emit and rethrow errors thrown by async listeners", async () => {
      const errorMessage = "async failure";
      const errorListener = jest.fn();

      emitter.on("error", errorListener);
      emitter.on("test", async () => {
        throw new Error(errorMessage);
      });

      await expect(
        emitter.emitAsync("test", new Event("test")),
      ).rejects.toThrow(errorMessage);

      expect(errorListener).toHaveBeenCalledTimes(1);
    });

    it("should NOT capture an async listener's value under synchronous emit", () => {
      const testEvent = new Event("test", { cancelable: true });

      emitter.on("test", async (event) => {
        await Promise.resolve();
        event.preventDefault();
        return "late-value";
      });

      emitter.emit("test", testEvent);

      expect(testEvent.returnValue).toBeUndefined();
    });
  });
});
