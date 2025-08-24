import type * as nx from "../types/Nexo.js";
import NexoEvent from "../events/NexoEvent.js";
import NexoEmitter from "./NexoEmitter.js";

/**
 * A specialized `Map` that stores {@link Traceable} objects wrapped in `WeakRef`.
 *
 * This map automatically cleans up entries whose targets are garbage-collected,
 * and emits events when modifications occur (`set`, `delete`, `clear`).
 *
 * @noInheritDoc
 * @param T - The type of traceable objects stored in the map.
 */
class NexoMap<T extends nx.Traceable>
  extends Map<string, WeakRef<T>>
  implements nx.TraceableMap<T>
{
  /**
   * Event emitter used to broadcast map changes.
   */
  private eventEmitter?: nx.EventEmitter = new NexoEmitter();

  /**
   * Removes an entry and optionally marks it as released,
   * emitting a `delete` event if an emitter is present.
   *
   * @param key - The key of the entry to remove.
   * @param released - Whether the removal was due to garbage collection.
   * @returns `true` if the entry was removed, otherwise `false`.
   */
  private remove(key: string, released: boolean = false): boolean {
    const removed = super.delete(key);

    if (this.eventEmitter) {
      const event = new NexoEvent("delete", {
        target: this,
        cancelable: false,
        data: { key, released },
      });
      this.eventEmitter.emit("delete", event);
    }

    return removed;
  }

  /**
   * Creates a new `NexoMap` instance.
   *
   * @param entries - Optional initial entries to populate the map.
   */
  constructor(entries?: Iterable<readonly [string, WeakRef<T>]>) {
    super(entries);
  }

  /**
   * Returns the current event emitter if present.
   */
  get events(): nx.EventEmitter | undefined {
    return this.eventEmitter;
  }

  /**
   * Adds or updates an entry in the map and emits a `set` event.
   *
   * @param key - The key associated with the object.
   * @param value - The `WeakRef` pointing to the object.
   * @returns The current map instance.
   */
  set(key: string, value: WeakRef<T>): this {
    super.set(key, value);

    if (this.eventEmitter) {
      const event = new NexoEvent("set", {
        target: this,
        cancelable: false,
        data: { key, value },
      });
      this.eventEmitter.emit("set", event);
    }

    return this;
  }

  /**
   * Deletes an entry and emits a `delete` event.
   *
   * @param key - The key of the entry to delete.
   * @returns `true` if the entry was removed, otherwise `false`.
   */
  delete(key: string): boolean {
    return this.remove(key);
  }

  /**
   * Removes all entries from the map and emits a `clear` event.
   */
  clear(): void {
    super.clear();

    if (this.eventEmitter) {
      const event = new NexoEvent("clear", {
        cancelable: false,
        target: this,
      });
      this.eventEmitter.emit("clear", event);
    }
  }

  /**
   * Cleans up entries whose `WeakRef` targets were garbage-collected.
   * Emits `delete` events for removed entries.
   */
  release(): void {
    for (const [key, weakRef] of this) {
      if (weakRef.deref() === undefined) {
        this.remove(key, true);
      }
    }
  }

  /**
   * Replaces the internal event emitter.
   *
   * @param emitter - The new event emitter.
   * @returns The current map instance.
   */
  setEventEmitter(emitter: nx.EventEmitter): this {
    this.eventEmitter = emitter;
    return this;
  }

  /**
   * Removes the event emitter. After this call, no events will be emitted.
   */
  removeEventEmitter(): void {
    this.eventEmitter = undefined;
  }
}

export default NexoMap;
