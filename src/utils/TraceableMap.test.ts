import TraceableMap from "./TraceableMap.js";

describe("TraceableMap", () => {
  it("Sets key-value pair and emits event", () => {
    const map = new TraceableMap();
    const setCallback = jest.fn();
    const value = new WeakRef({});

    map.events.on("set", setCallback);
    map.set("foo", value);

    const [setEvent]: [nx.Event] = setCallback.mock.lastCall;

    expect(setCallback).toHaveBeenCalledTimes(1);
    expect(setEvent.name).toBe("set");
    expect(setEvent.target).toBe(map);
    expect(setEvent.data).toStrictEqual({ key: "foo", value });
    expect(map.size).toBe(1);
  });

  it("Delete key-value pair and emits event", () => {
    const map = new TraceableMap();
    const deleteCallback = jest.fn();
    const value = new WeakRef({});

    map.events.on("delete", deleteCallback);
    map.set("foo", value);
    map.delete("foo");

    const [deleteEvent] = deleteCallback.mock.lastCall;

    expect(deleteCallback).toHaveBeenCalledTimes(1);
    expect(deleteEvent.name).toBe("delete");
    expect(deleteEvent.target).toBe(map);
    expect(deleteEvent.data).toStrictEqual({ key: "foo", released: false });
    expect(map.size).toBe(0);
  });

  it("Clears the map and emits event", () => {
    const map = new TraceableMap();
    const clearCalback = jest.fn();
    const value = new WeakRef({});

    map.events.on("clear", clearCalback);
    map.set("foo", value);
    map.set("bar", value);

    map.clear();

    const [clearEvent] = clearCalback.mock.lastCall;

    expect(clearCalback).toHaveBeenCalledTimes(1);
    expect(clearEvent.name).toBe("clear");
    expect(clearEvent.target).toBe(map);
    expect(clearEvent.data).toBeUndefined();
    expect(map.size).toBe(0);
  });

  it("Removes entries whose WeakRef targets have been garbage collected", () => {
    const map = new TraceableMap();
    const deleteCallback = jest.fn();

    const weakRefMock = {
      deref() {},
    } as WeakRef<object>;

    map.events.on("delete", deleteCallback);

    map.set("foo", weakRefMock);
    map.set("bar", weakRefMock);

    map.release();

    const [firstDeleteCall, secondDeleteCall] = deleteCallback.mock.calls;
    const [firstDeleteEvent] = firstDeleteCall;
    const [secondDeleteEvent] = secondDeleteCall;

    expect(map.size).toBe(0);
    expect(deleteCallback).toHaveBeenCalledTimes(2);
    expect(firstDeleteEvent.data).toStrictEqual({ key: "foo", released: true });
    expect(secondDeleteEvent.data).toStrictEqual({
      key: "bar",
      released: true,
    });
  });

  it("Releases a bounded number of entries per call and reports progress", () => {
    const map = new TraceableMap();
    const deadRef = {
      deref() {},
    } as WeakRef<object>;

    map.set("foo", deadRef);
    map.set("bar", deadRef);
    map.set("baz", deadRef);

    // First bounded call only checks two of the three entries.
    expect(map.release(2)).toBe(true);
    expect(map.size).toBe(1);

    // The next bounded call finishes the pass.
    expect(map.release(2)).toBe(false);
    expect(map.size).toBe(0);
  });

  it("Skips live entries and removes only collected ones across bounded calls", () => {
    const map = new TraceableMap();
    const alive = {};
    const liveRef = new WeakRef(alive);
    const deadRef = {
      deref() {},
    } as WeakRef<object>;

    map.set("live", liveRef);
    map.set("dead", deadRef);

    // Drain with bounded calls, as a consumer would do periodically.
    let passes = 0;
    while (map.release(1) && passes < 10) {
      passes++;
    }

    expect(map.size).toBe(1);
    expect(map.has("live")).toBe(true);
    expect(map.has("dead")).toBe(false);
  });

  it("Registers live targets without throwing", () => {
    const map = new TraceableMap();
    const target = {};
    const ref = new WeakRef(target);

    expect(() => map.set("foo", ref)).not.toThrow();
    expect(map.get("foo")).toBe(ref);
  });
});
