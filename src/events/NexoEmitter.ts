import type nx from "../types/Nexo.js";
import EventEmitter from "events";
import NexoEvent from "./NexoEvent.js";

class NexoEmitter extends EventEmitter {
  constructor() {
    super({ captureRejections: true });

    this.on("error", (error: Error) => {
      new NexoEvent("error", { target: this, data: error });
    });
  }

  emit<Event extends NexoEvent>(
    eventName: nx.objectKey,
    event: Event,
    ...args: nx.arrayLike
  ): boolean {
    const listeners = this.listeners(eventName);

    try {
      listeners.forEach((listener) => {
        const returnValue = listener.call(this, event, ...args);
        // ignore non defaultPrevented events
        if (event.defaultPrevented === false) return;
        // ignore when event.returnValue is set manually
        // listeners can check when 'returnValue' is set and thus transform or leave as is
        event.returnValue = returnValue;
      });
    } catch (error) {
      this.emit("error", error);
    }

    return listeners.length > 0;
  }
}

export default NexoEmitter;
