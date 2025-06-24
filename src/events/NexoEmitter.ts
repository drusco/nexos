import type * as nx from "../types/Nexo.js";
import NexoEvent from "./NexoEvent.js";

/**
 * A custom event emitter for proxy-related events.
 *
 * @remarks
 * This class manages event subscriptions and emissions for internal proxy instrumentation.
 * Unlike Node.js `EventEmitter`, this implementation is portable and fully synchronous,
 * making it suitable for performance-sensitive contexts like JavaScript proxy handlers.
 *
 * ### Emitted Events
 * - `'error'` — Emitted on unhandled errors.
 * - `'proxy'` — General proxy events.
 * - `'proxy.get'`, `'proxy.set'`, etc. — Specific proxy handler hooks.
 *
 * ### Notes
 * - **Listeners are executed synchronously.** If a listener returns a Promise,
 *   its rejection is not captured automatically — consumers must handle rejections inside listeners.
 * - If an error is passed as the event data and the event is not `'error'`, the same error is also emitted on `'error'`.
 *
 * @example
 * const emitter = new NexoEmitter();
 * emitter.on('proxy.get', (event) => {
 *   if (event.key === 'secret') event.preventDefault();
 * });
 * emitter.emit('proxy.get', new NexoEvent({ key: 'secret' }));
 */
class NexoEmitter implements nx.EventEmitter {
  private listeners = new Map<nx.ObjectKey, Set<nx.FunctionLike>>();

  /**
   * Registers a listener for the specified event.
   *
   * @remarks
   * The listener will be called every time the event is emitted.
   * Multiple listeners can be registered for the same event, and they
   * will be executed in the order in which they were added.
   *
   * This method does not check for duplicates — adding the same function
   * multiple times will result in multiple calls.
   *
   * @param event - The event name to listen for.
   * @param listener - The function to call when the event is emitted.
   * @returns The current instance for chaining.
   *
   * @example
   * emitter.on('proxy.set', (event) => {
   *   console.log('Property set:', event.key);
   * });
   */
  on(event: nx.ObjectKey, listener: nx.FunctionLike): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return this;
  }

  /**
   * Unregisters a listener from the specified event.
   *
   * @remarks
   * If the listener is not registered for the given event, this method does nothing.
   * Only the exact function reference passed to `on()` can be removed.
   *
   * Removing a listener helps avoid memory leaks and unnecessary processing.
   *
   * @param event - The event name to stop listening to.
   * @param listener - The function to remove from the event's listener list.
   * @returns The current instance for chaining.
   *
   * @example
   * const handler = (event) => console.log('Accessed:', event.key);
   * emitter.on('proxy.get', handler);
   * emitter.off('proxy.get', handler);
   */
  off(event: nx.ObjectKey, listener: nx.FunctionLike): this {
    this.listeners.get(event)?.delete(listener);
    return this;
  }

  /**
   * Emits an event and synchronously triggers all associated listeners.
   *
   * @remarks
   * Listeners are executed immediately. If a listener throws,
   * the error is re-emitted via the `'error'` event.
   *
   * If `data` is an `Error` and the event name is not `'error'`,
   * it will be forwarded to the `'error'` listeners.
   *
   * @param eventName - The name of the event to emit.
   * @param data - A `NexoEvent` or an `Error`.
   * @param args - Additional arguments passed to each listener.
   * @returns `true` if any listeners were triggered; `false` otherwise.
   */
  emit<Event extends NexoEvent>(
    eventName: nx.ObjectKey,
    data: Event | Error,
    ...args: nx.ArrayLike
  ): boolean {
    const listeners = this.listeners.get(eventName);
    const hasListeners = !!listeners?.size;
    const isError = data instanceof Error;
    const errorListeners = this.listeners.get("error");

    if (!hasListeners) return false;

    // Re-emit errors if the eventName is not "error"
    if (isError && eventName !== "error") {
      if (errorListeners?.size) {
        this.emit("error", data, ...args);
      } else {
        throw data; // crash app intentionally to surface unhandled error
      }
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
      if (errorListeners?.size) {
        this.emit("error", error);
      } else {
        throw error;
      }
    }

    return hasListeners;
  }
}

export default NexoEmitter;
