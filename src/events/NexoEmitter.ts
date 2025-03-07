import type * as nx from "../types/Nexo.js";
import EventEmitter from "events";
import NexoEvent from "./NexoEvent.js";

/**
 * A custom event emitter class for managing events related to proxy creation and manipulation.
 *
 * @remarks
 * This class extends the native `EventEmitter` and provides enhanced functionality
 * for emitting events with custom data types and handling errors gracefully.
 * It emits the following events:
 * - `error` for any error occurrences.
 * - `proxy` for events related to proxies.
 * - Specific proxy handler events like `proxy.get`, `proxy.set`, etc.
 *
 * @example
 * const emitter = new NexoEmitter();
 * emitter.on('proxy', (event) => {
 *   console.log(event);
 * });
 *
 * emitter.emit('proxy', { message: 'New proxy created!' });
 */
class NexoEmitter extends EventEmitter {
  /**
   * Creates an instance of `NexoEmitter`.
   *
   * @remarks
   * The constructor of this class calls the `EventEmitter` constructor and enables
   * the capture of unhandled promise rejections.
   */
  constructor() {
    super({ captureRejections: true });
  }

  /**
   * Emits an event and triggers any associated listeners.
   *
   * @remarks
   * This method overrides the default `EventEmitter.emit` method to handle custom logic
   * such as error propagation, event data transformation, and checking if the event
   * has any listeners. It also ensures that non-default prevented events are properly handled.
   *
   * If an error is passed as the event data and the event name is not 'error',
   * the error will be re-emitted under the 'error' event.
   *
   * @param eventName - The name of the event to emit.
   * @param data - The data or error to send with the event. It can be a custom `NexoEvent` or an instance of `Error`.
   * @param args - Additional arguments that can be passed to listeners.
   * @returns A boolean indicating whether the event had any listeners.
   *
   * @example
   * emitter.emit('proxy', { message: 'New proxy created!' });
   * emitter.emit('error', new Error('An error occurred'));
   */
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

        // Ignore non-defaultPrevented events
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
