import Nexo from "./Nexo.js";
import NexoTS from "./types/Nexo.js";

describe("Nexo", () => {
  it("Creates a new nexo instance", () => {
    const nexo = new Nexo();

    expect(nexo.links).toBeInstanceOf(Map);
    expect(nexo.entries).toBeInstanceOf(Map);
  });

  it("Links an id to an object", () => {
    const nexo = new Nexo();
    const target = {};

    nexo.link("foo", target);

    expect(nexo.links.has("foo")).toBe(true);
    expect(nexo.links.get("foo").deref()).toBe(target);
  });

  it("Emits an event on new links", () => {
    const nexo = new Nexo();
    const linkCallback = jest.fn();
    const target = {};

    nexo.on("nx.link", linkCallback);
    nexo.link("foo", target);

    const [linkEvent] = linkCallback.mock.lastCall;

    expect(linkCallback).toHaveBeenCalledTimes(1);
    expect(linkEvent.name).toBe("nx.link");
    expect(linkEvent.target).toBe(nexo);
    expect(linkEvent.data).toEqual({ id: "foo", target });
  });

  it("Unlinks an id from the links map", () => {
    const nexo = new Nexo();
    const target = {};

    nexo.link("foo", target);
    nexo.unlink("foo");

    expect(nexo.links.has("foo")).toBe(false);
  });

  it("Emits and event on unlink", () => {
    const nexo = new Nexo();
    const unlinkCallback = jest.fn();
    const target = {};

    nexo.link("foo", target);
    nexo.on("nx.unlink", unlinkCallback);
    nexo.unlink("foo");

    const [unlinkEvent] = unlinkCallback.mock.lastCall;

    expect(unlinkCallback).toHaveBeenCalledTimes(1);
    expect(unlinkEvent.name).toBe("nx.unlink");
    expect(unlinkEvent.target).toBe(nexo);
    expect(unlinkEvent.data).toEqual({ id: "foo" });
  });

  it("Clears both the links and entries map", () => {
    const nexo = new Nexo();

    nexo.set("foo", {});
    nexo.link("bar", {});

    nexo.clear();

    expect(nexo.entries.size).toBe(0);
    expect(nexo.links.size).toBe(0);
  });

  it("Emits and event on clear", () => {
    const nexo = new Nexo();
    const clearCallback = jest.fn();

    nexo.on("nx.clear", clearCallback);

    nexo.set("foo", {});
    nexo.link("bar", {});

    nexo.clear();

    const [clearEvent] = clearCallback.mock.lastCall;

    expect(clearCallback).toHaveBeenCalledTimes(1);
    expect(clearEvent.name).toBe("nx.clear");
    expect(clearEvent.target).toBe(nexo);
    expect(clearEvent.data).toBeUndefined();
  });

  it("Releases both the links and entries map", () => {
    const nexo = new Nexo();

    const weakRefMock = {
      deref() {},
    } as WeakRef<NexoTS.traceable>;

    nexo.entries.set("foo", weakRefMock);
    nexo.links.set("bar", weakRefMock);

    nexo.release();

    expect(nexo.entries.size).toBe(0);
    expect(nexo.links.size).toBe(0);
  });

  it("Emits a release event", () => {
    const nexo = new Nexo();
    const releaseCallback = jest.fn();

    const weakRefMock = {
      deref() {},
    } as WeakRef<NexoTS.traceable>;

    nexo.on("nx.release", releaseCallback);
    nexo.entries.set("foo", weakRefMock);
    nexo.links.set("bar", weakRefMock);

    nexo.release();

    const [releaseEvent] = releaseCallback.mock.lastCall;

    expect(releaseCallback).toHaveBeenCalledTimes(1);
    expect(releaseEvent.name).toBe("nx.release");
    expect(releaseEvent.target).toBe(nexo);
    expect(releaseEvent.data).toEqual({ links: 0, entries: 0 });
  });

  it("Emits a delete event on release", () => {
    const nexo = new Nexo();
    const deleteCallback = jest.fn();

    const weakRefMock = {
      deref() {},
    } as WeakRef<NexoTS.traceable>;

    nexo.on("nx.delete", deleteCallback);
    nexo.entries.set("foo", weakRefMock);
    nexo.release();

    const [deleteEvent] = deleteCallback.mock.lastCall;

    expect(deleteCallback).toHaveBeenCalledTimes(1);
    expect(deleteEvent.name).toBe("nx.delete");
    expect(deleteEvent.target).toBe(nexo);
    expect(deleteEvent.data).toEqual({ id: "foo", target: undefined });
  });

  it("Emits and unlink event on release", () => {
    const nexo = new Nexo();
    const unlinkCallback = jest.fn();

    const weakRefMock = {
      deref() {},
    } as WeakRef<NexoTS.traceable>;

    nexo.on("nx.unlink", unlinkCallback);
    nexo.links.set("foo", weakRefMock);
    nexo.release();

    const [unlinkEvent] = unlinkCallback.mock.lastCall;

    expect(unlinkCallback).toHaveBeenCalledTimes(1);
    expect(unlinkEvent.name).toBe("nx.unlink");
    expect(unlinkEvent.target).toBe(nexo);
    expect(unlinkEvent.data).toEqual({ id: "foo", target: undefined });
  });

  it("Sets an id to an entry", () => {
    const nexo = new Nexo();
    const target = {};

    nexo.set("foo", target);

    expect(nexo.entries.has("foo")).toBe(true);
    expect(nexo.entries.get("foo").deref()).toBe(target);
  });

  it("Emits an event on new entries", () => {
    const nexo = new Nexo();
    const setCallback = jest.fn();
    const target = {};

    nexo.on("nx.create", setCallback);
    nexo.set("foo", target);

    const [setEvent] = setCallback.mock.lastCall;

    expect(setCallback).toHaveBeenCalledTimes(1);
    expect(setEvent.name).toBe("nx.create");
    expect(setEvent.target).toBe(nexo);
    expect(setEvent.data).toEqual({ id: "foo", target });
  });

  it("Deletes an id from the entries map", () => {
    const nexo = new Nexo();
    const target = {};

    nexo.set("foo", target);
    nexo.delete("foo");

    expect(nexo.entries.has("foo")).toBe(false);
  });

  it("Emits and event on delete", () => {
    const nexo = new Nexo();
    const deleteCallback = jest.fn();
    const target = {};

    nexo.set("foo", target);
    nexo.on("nx.delete", deleteCallback);
    nexo.delete("foo");

    const [deleteEvent] = deleteCallback.mock.lastCall;

    expect(deleteCallback).toHaveBeenCalledTimes(1);
    expect(deleteEvent.name).toBe("nx.delete");
    expect(deleteEvent.target).toBe(nexo);
    expect(deleteEvent.data).toEqual({ id: "foo" });
  });
});
