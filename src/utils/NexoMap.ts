import type * as nx from "../types/Nexo.js";
import NexoEvent from "../events/NexoEvent.js";
import NexoEmitter from "../events/NexoEmitter.js";

/**
 * A specialized `Map` that holds weak references to traceable targets.
 * This class emits events when modifications occur.
 *
 * @template Target - The type of objects stored in the map, which must be traceable.
 */
class NexoMap<Target extends nx.Traceable> extends Map<
  string,
  WeakRef<Target>
> {
  /**
   * Stores the key of the last released entry during a `release` operation.
   * Used internally to track which key was removed.
   */
  private releaseKey: string;

  /**
   * Event emitter instance for broadcasting changes to the map.
   */
  readonly events: NexoEmitter;

  /**
   * Creates an instance of `NexoMap`.
   */
  constructor() {
    super();
    this.events = new NexoEmitter();
  }

  /**
   * Adds or updates an entry in the map and emits a `set` event.
   *
   * @param key - The key associated with the weak reference.
   * @param value - The `WeakRef` wrapping the target object.
   * @returns The updated `NexoMap` instance.
   */
  set(key: string, value: WeakRef<Target>): this {
    super.set(key, value);

    const event = new NexoEvent("set", {
      target: this,
      data: { key, value },
    });

    this.events.emit(event.name, event);

    return this;
  }

  /**
   * Removes an entry from the map and emits a `delete` event.
   *
   * @param key - The key of the entry to remove.
   * @returns `true` if the entry existed and was deleted, otherwise `false`.
   */
  delete(key: string): boolean {
    const existed = super.delete(key);

    const event = new NexoEvent("delete", {
      target: this,
      data: {
        key,
        released: this.releaseKey === key,
      },
    });

    this.events.emit(event.name, event);

    return existed;
  }

  /**
   * Clears all entries from the map and emits a `clear` event.
   */
  clear(): void {
    super.clear();

    const event = new NexoEvent("clear", { target: this });
    this.events.emit(event.name, event);
  }

  /**
   * Iterates over the map and removes entries whose `WeakRef` target has been garbage collected.
   * Emits a `release` event after processing.
   */
  release(): void {
    for (const [key, weakRef] of this) {
      if (weakRef.deref() === undefined) {
        this.releaseKey = key;
        this.delete(key);
        delete this.releaseKey;
      }
    }

    const event = new NexoEvent("release", { target: this });

    this.events.emit(event.name, event);
  }
}

export default NexoMap;
