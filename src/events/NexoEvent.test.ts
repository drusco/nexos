import NexoEvent from "./NexoEvent.js";

describe("NexoEvent", () => {
  it("Creates a new nexo event", () => {
    const event = new NexoEvent("foo");

    expect(event.name).toBe("foo");
    expect(event.data).toBeUndefined();
    expect(event.target).toBeUndefined();
    expect(Number.isInteger(event.timestamp)).toBe(true);
    expect(event.returnValue).toBeUndefined();
    expect(event.defaultPrevented).toBe(false);
  });

  it("Creates a new event with target", () => {
    const target = [];
    const event = new NexoEvent("foo", { target });

    expect(event.target).toBe(target);
  });

  it("Creates a new event with data", () => {
    const data = {};
    const event = new NexoEvent("foo", { data });

    expect(event.data).toBe(data);
  });

  it("Prevents the event default behaviour", () => {
    const event = new NexoEvent("foo", { cancelable: true });
    event.preventDefault();

    expect(event.defaultPrevented).toBe(true);
  });

  it("Cannot prevent a non cancelable event", () => {
    const event = new NexoEvent("foo");
    event.preventDefault();

    expect(event.defaultPrevented).toBe(false);
  });
});
