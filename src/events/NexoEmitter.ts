import type * as nx from "../types/Nexo.js";

/**
 * A minimal, synchronous event emitter for proxy-related instrumentation.
 *
 * @remarks
 * `NexoEmitter` is a purpose-built event manager designed for performance-critical
 * environments such as JavaScript Proxy traps. It executes listeners synchronously
 * and supports event cancellation (`defaultPrevented`) and return value capture (`returnValue`).
 *
 * This emitter intentionally does **not** support async listener chaining,
 * and errors thrown by listeners will crash the app unless an `'error'` handler is attached.
 *
 * ### Usage Notes
 * - Use `on(event, fn)` to attach listeners.
 * - Use `off(event, fn)` to remove them.
 * - Use `emit(event, data)` to dispatch a `NexoEvent` or `Error`.
 *
 * ### Behavior
 * - If an `Error` is passed to `emit()` (and the event is not `"error"`), it is re-emitted on `"error"`.
 * - If no `"error"` listener exists, the app will throw to ensure fail-fast behavior.
 * - If a `NexoEvent` is emitted and `defaultPrevented` is `false`, listeners' `returnValue` will be ignored.
 *
 * ### Example
 * ```ts
 * const emitter = new NexoEmitter();
 * emitter.on("proxy.set", (event) => {
 *   if (event.key === "password") event.preventDefault();
 * });
 *
 * emitter.emit("proxy.set", new NexoEvent({ key: "password" }));
 * ```
 */
class NexoEmitter<Events extends nx.NexoEmitterEvents = nx.NexoEmitterEvents>
  implements nx.NexoEmitter<Events>
{
  private listeners = new Map<string, Set<nx.FunctionLike>>();

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

  on<K extends Extract<keyof Events, string>>(
    event: K,
    listener: nx.FunctionLike<
      [Events[K]],
      Events[K] extends nx.NexoEvent ? Events[K]["returnValue"] : void
    >,
  ): this {
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
  off<K extends Extract<keyof Events, string>>(
    event: K,
    listener: nx.FunctionLike<
      [Events[K]],
      Events[K] extends nx.NexoEvent ? Events[K]["returnValue"] : void
    >,
  ): this {
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
   * @returns `true` if any listeners were triggered; `false` otherwise.
   */
  emit<K extends Extract<keyof Events, string> | "error">(
    eventName: K,
    data: Events[K] extends nx.NexoEvent ? Events[K] : Error,
  ): boolean {
    const listeners = this.listeners.get(eventName);
    const hasListeners = !!listeners?.size;
    const isError = data instanceof Error;
    const errorListeners = this.listeners.get("error");

    // Re-emit errors if the eventName is not "error"
    if (isError && eventName !== "error") {
      if (errorListeners?.size) {
        this.emit("error", data);
      } else {
        throw data; // crash app intentionally to surface unhandled error
      }
    }

    if (!hasListeners) return false;

    try {
      for (const listener of listeners) {
        const returnValue = listener.call(this, data);

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
