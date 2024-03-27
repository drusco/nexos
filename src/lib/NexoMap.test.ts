import NexoMap from "./NexoMap.js";

describe("NexoMap", () => {
  it("Sets key-value pair and emits event", () => {
    const map = new NexoMap();
    const setCallback = jest.fn();
    const value = new WeakRef({});

    map.events.on("nx.map.set", setCallback);
    map.set("foo", value);

    const [setEvent] = setCallback.mock.lastCall;

    expect(setCallback).toHaveBeenCalledTimes(1);
    expect(setEvent.name).toBe("nx.map.set");
    expect(setEvent.target).toBe(map);
    expect(setEvent.data).toEqual({ key: "foo", value });
    expect(map.size).toBe(1);
  });

  it("Delete key-value pair and emits event", () => {
    const map = new NexoMap();
    const deleteCallback = jest.fn();
    const value = new WeakRef({});

    map.events.on("nx.map.delete", deleteCallback);
    map.set("foo", value);
    map.delete("foo");

    const [deleteEvent] = deleteCallback.mock.lastCall;

    expect(deleteCallback).toHaveBeenCalledTimes(1);
    expect(deleteEvent.name).toBe("nx.map.delete");
    expect(deleteEvent.target).toBe(map);
    expect(deleteEvent.data).toEqual({ key: "foo", released: false });
    expect(map.size).toBe(0);
  });

  it("Clears the map and emits event", () => {
    const map = new NexoMap();
    const clearCalback = jest.fn();
    const value = new WeakRef({});

    map.events.on("nx.map.clear", clearCalback);
    map.set("foo", value);
    map.set("bar", value);

    map.clear();

    const [clearEvent] = clearCalback.mock.lastCall;

    expect(clearCalback).toHaveBeenCalledTimes(1);
    expect(clearEvent.name).toBe("nx.map.clear");
    expect(clearEvent.target).toBe(map);
    expect(clearEvent.data).toBeUndefined();
    expect(map.size).toBe(0);
  });

  it("Releases the internal memory and emits event", () => {
    const map = new NexoMap();
    const releaseCallback = jest.fn();
    const deleteCallback = jest.fn();

    const weakRefMock = {
      deref() {},
    } as WeakRef<object>;

    map.events.on("nx.map.release", releaseCallback);
    map.events.on("nx.map.delete", deleteCallback);

    map.set("foo", weakRefMock);
    map.set("bar", weakRefMock);

    map.release();

    const [firstDeleteCall, secondDeleteCall] = deleteCallback.mock.calls;
    const [releaseEvent] = releaseCallback.mock.lastCall;
    const [firstDeleteEvent] = firstDeleteCall;
    const [secondDeleteEvent] = secondDeleteCall;

    expect(releaseCallback).toHaveBeenCalledTimes(1);
    expect(releaseEvent.name).toBe("nx.map.release");
    expect(releaseEvent.target).toBe(map);
    expect(releaseEvent.data).toBeUndefined();
    expect(map.size).toBe(0);

    expect(deleteCallback).toHaveBeenCalledTimes(2);
    expect(firstDeleteEvent.data.released).toBe(true);
    expect(secondDeleteEvent.data.released).toBe(true);
  });
});
