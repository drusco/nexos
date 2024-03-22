import EventEmitter from "events";
import NexoEvent from "../events/NexoEvent.js";

class NexoError extends Error {
  constructor(message: string, emitter?: EventEmitter) {
    super(message);

    if (emitter) {
      const event = new NexoEvent("nx.error", emitter, this);
      emitter.emit(event.name, event);
    }
  }
}

export default NexoError;
