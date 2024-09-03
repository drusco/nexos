import type nx from "../types/Nexo.js";
import NexoEvent from "../events/NexoEvent.js";
import Nexo from "../Nexo.js";
import update from "./update.js";
import isProxy from "../utils/isProxy.js";

describe("update", () => {
  it("Emits an update event", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const updateWith = 1;
    const listener = jest.fn();

    nexo.on("update", listener);

    const result = update(proxy, updateWith);

    const [updateEvent]: [NexoEvent<nx.Proxy, number>] = listener.mock.lastCall;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(updateEvent.target).toBe(proxy);
    expect(updateEvent.cancelable).toBe(false);
    expect(updateEvent.data).toBe(updateWith);
    expect(result).toBe(updateWith);
  });

  it("Converts an object to proxy and emits the update event", () => {
    const nexo = new Nexo();
    const proxy = nexo.create();
    const updateWith = [];
    const updateListener = jest.fn();
    const proxyListener = jest.fn();

    nexo.on("update", updateListener);
    nexo.on("proxy", proxyListener);

    const result = update(proxy, updateWith);

    const [updateEvent]: [NexoEvent<nx.Proxy, nx.Proxy>] =
      updateListener.mock.lastCall;

    const [proxyEvent]: [NexoEvent<nx.Proxy, { target: object }>] =
      proxyListener.mock.lastCall;

    expect(updateListener).toHaveBeenCalledTimes(1);
    expect(proxyListener).toHaveBeenCalledTimes(1);
    expect(updateEvent.target).toBe(proxy);
    expect(updateEvent.cancelable).toBe(false);
    expect(updateEvent.data).toBe(result);
    expect(isProxy(updateEvent.data)).toBe(true);
    expect(proxyEvent.data.target).toBe(updateWith);
    expect(proxyEvent.target).toBe(result);
  });
});
