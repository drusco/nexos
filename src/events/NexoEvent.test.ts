import NexoEvent from "./NexoEvent.js";

describe("NexoEvent", () => {
  it("initializes a new event with default values", () => {
    const now = Date.now();
    const event = new NexoEvent("foo");

    expect(event.name).toBe("foo");
    expect(event.data).toBeUndefined();
    expect(event.target).toBeUndefined();
    expect(event.returnValue).toBeUndefined();
    expect(event.defaultPrevented).toBe(false);
    expect(Number.isInteger(event.timestamp)).toBe(true);
    expect(event.timestamp).toBeGreaterThanOrEqual(now);
    expect(event.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it("sets the target if provided", () => {
    const target = { id: 1 };
    const event = new NexoEvent("foo", { target });

    expect(event.target).toBe(target);
  });

  it("sets the data if provided", () => {
    const data = { key: "value" };
    const event = new NexoEvent("foo", { data });

    expect(event.data).toBe(data);
  });

  it("sets the cancelable flag to true when passed", () => {
    const event = new NexoEvent("foo", { cancelable: true });

    expect(() => event.preventDefault()).not.toThrow();
    expect(event.defaultPrevented).toBe(true);
  });

  it("does not prevent default when event is not cancelable", () => {
    const event = new NexoEvent("foo");

    event.preventDefault();

    expect(event.defaultPrevented).toBe(false);
  });

  it("supports assigning a returnValue", () => {
    const returnValue = Symbol("return");
    const event = new NexoEvent("bar");

    event.returnValue = returnValue;

    expect(event.returnValue).toBe(returnValue);
  });

  it("handles all options at once", () => {
    const target = { id: 2 };
    const data = { foo: "bar" };
    const event = new NexoEvent("baz", {
      cancelable: true,
      data,
      target,
    });

    expect(event.name).toBe("baz");
    expect(event.data).toBe(data);
    expect(event.target).toBe(target);
    event.preventDefault();
    expect(event.defaultPrevented).toBe(true);
  });
});
