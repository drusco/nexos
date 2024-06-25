import type nx from "../types/Nexo.js";
import EventEmitter from "events";
import NexoError from "../errors/NexoError.js";
import NexoEvent from "./NexoEvent.js";

class NexoEmitter extends EventEmitter {
  constructor() {
    super({ captureRejections: true });

    this.on("error", (error) => {
      new NexoError(error.message, this);
    });
  }

  emit(
    eventName: nx.objectKey,
    event: NexoEvent,
    ...args: nx.arrayLike
  ): boolean {
    const listeners = this.listeners(eventName);

    listeners.forEach((listener) => {
      const returnValue = listener.call(this, event, ...args);
      // ignore non defaultPrevented events
      if (event.defaultPrevented === false) return;
      // ignore when event.returnValue is set manually
      event.returnValue = returnValue;
    });

    return listeners.length > 0;
  }
}

export default NexoEmitter;
