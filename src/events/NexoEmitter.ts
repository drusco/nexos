import EventEmitter from "events";
import NexoError from "../errors/NexoError.js";

class NexoEmitter extends EventEmitter {
  constructor() {
    super({ captureRejections: true });

    this.on("error", (error) => {
      new NexoError(error.message, this);
    });
  }
}

export default NexoEmitter;
