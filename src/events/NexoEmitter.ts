import type * as nx from "../types/Nexo.js";
import EventEmitter from "events";
import NexoEvent from "./NexoEvent.js";

class NexoEmitter extends EventEmitter {
  constructor() {
    super({ captureRejections: true });
  }

  emit<Event extends NexoEvent>(
    eventName: nx.ObjectKey,
    data: Event | Error,
    ...args: nx.ArrayLike
  ): boolean {
    const listeners = this.listeners(eventName);
    const hasListeners = listeners.length > 0;
    const isError = data instanceof Error;

    // Re-emit errors if the eventName is not "error"
    if (isError && eventName !== "error") {
      this.emit("error", data, ...args);
    }

    try {
      for (const listener of listeners) {
        const returnValue = listener.call(this, data, ...args);

        if (isError) continue;

        // Ignore non defaultPrevented events
        if (data.defaultPrevented === false) continue;
        // Ignore when event.returnValue is set manually
        // Listeners can check when 'returnValue' is set and thus transform or leave as is
        data.returnValue = returnValue;
      }
    } catch (error) {
      this.emit("error", error);
    }

    return hasListeners;
  }
}

export default NexoEmitter;
