import NexoError from "../errors/NexoError.js";
import NexoEmitter from "../events/NexoEmitter.js";
import NexoEvent from "./NexoEvent.js";

describe("NexoEmitter", () => {
  it("Emits the 'error' and 'nx.error' events", () => {
    const emitter = new NexoEmitter();
    const errorCallback = jest.fn();
    const nxErrorCallback = jest.fn();
    const errorMessage = "something went wrong";

    emitter.on("error", errorCallback);
    emitter.on("nx.error", nxErrorCallback);

    emitter.on("test", () => {
      throw Error(errorMessage);
    });

    emitter.emit("test", new NexoEvent("test"));

    const [errorEvent] = errorCallback.mock.lastCall;
    const [nxErrorEvent] = nxErrorCallback.mock.lastCall;

    expect(errorCallback).toHaveBeenCalledTimes(1);
    expect(nxErrorCallback).toHaveBeenCalledTimes(1);

    expect(errorEvent).toBeInstanceOf(Error);
    expect(errorEvent.message).toBe(errorMessage);
    expect(nxErrorEvent).toBeInstanceOf(NexoEvent);
    expect(nxErrorEvent.name).toBe("nx.error");
    expect(nxErrorEvent.target).toBe(emitter);
    expect(nxErrorEvent.data).toBeInstanceOf(NexoError);
    expect(nxErrorEvent.data.message).toBe(errorMessage);
  });

  it("Emits a NexoEvent with optional arguments", () => {
    const emitter = new NexoEmitter();
    const callback = jest.fn();
    const nexoEvent = new NexoEvent("test");

    emitter.on("test", callback);
    emitter.on("test", callback);

    emitter.emit("test", nexoEvent, true);

    const [event, arg] = callback.mock.lastCall;

    expect(callback).toHaveBeenCalledTimes(2);
    expect(event).toBe(nexoEvent);
    expect(event.name).toBe("test");
    expect(arg).toBe(true);
  });

  it("Adds the return value to the events 'returnValue' property", () => {
    const emitter = new NexoEmitter();
    const nexoEvent = new NexoEvent("test", { cancellable: true });
    const returnValue = new Object();

    emitter.on("test", (event: NexoEvent) => {
      event.preventDefault();
      return returnValue;
    });

    emitter.emit("test", nexoEvent);

    expect(nexoEvent.returnValue).toBe(returnValue);
  });
});
