import NexoEvent from "../events/NexoEvent.js";
import NexoEmitter from "../events/NexoEmitter.js";

class NexoError extends Error {
  constructor(message: string, target?: object, ...emitters: NexoEmitter[]) {
    super(message);

    if (emitters.length) {
      const event = new NexoEvent("nx.error", { target, data: this });
      emitters.forEach((emitter) => emitter.emit(event.name, event));
    }
  }
}

export default NexoError;
