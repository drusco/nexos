import Event from "../events/Event.js";
import EventEmitter from "./EventEmitter.js";

/**
 * A map that stores objects wrapped in `WeakRef` for traceability.
 *
 * This map automatically cleans up entries whose targets are garbage-collected,
 * and emits events when modifications occur.
 *
 * @noInheritDoc
 * @typeParam K - The type of keys used in the map.
 * @typeParam V - The type of object values stored in the map.
 */
class TraceableMap<K, V extends object>
  extends Map<K, WeakRef<V>>
  implements nx.EventEmittable<nx.TraceableMapEvents<K, V>>
{
  /**
   * Event emitter used to broadcast map changes.
   */
  private readonly eventEmitter = new EventEmitter<
    nx.TraceableMapEvents<K, V>
  >();

  /**
   * Removes an entry and optionally marks it as released,
   * emitting a `delete` event.
   *
   * @param key - The key of the entry to remove.
   * @param released - Whether the removal was due to garbage collection.
   * @returns `true` if the entry was removed, otherwise `false`.
   */
  private remove(key: K, released: boolean = false): boolean {
    const removed = super.delete(key);

    const event = new Event("delete", {
      target: this,
      cancelable: false,
      data: { key, released },
    });
    this.eventEmitter.emit("delete", event);

    return removed;
  }

  /**
   * Creates a new `TraceableMap` instance.
   *
   * @param entries - Optional initial entries to populate the map.
   */
  constructor(entries?: Iterable<readonly [K, WeakRef<V>]>) {
    super(entries);
  }

  /**
   * Returns the event emitter used to broadcast map changes.
   */
  get events(): nx.EventEmitter<nx.TraceableMapEvents<K, V>> {
    return this.eventEmitter;
  }

  /**
   * Adds or updates an entry in the map and emits a `set` event.
   *
   * @param key - The key associated with the object.
   * @param value - The `WeakRef` pointing to the object.
   * @returns The current map instance.
   */
  set(key: K, value: WeakRef<V>): this {
    super.set(key, value);

    const event = new Event("set", {
      target: this,
      cancelable: false,
      data: { key, value },
    });
    this.eventEmitter.emit("set", event);

    return this;
  }

  /**
   * Deletes an entry and emits a `delete` event.
   *
   * @param key - The key of the entry to delete.
   * @returns `true` if the entry was removed, otherwise `false`.
   */
  delete(key: K): boolean {
    return this.remove(key);
  }

  /**
   * Removes all entries from the map and emits a `clear` event.
   */
  clear(): void {
    super.clear();

    const event = new Event("clear", {
      cancelable: false,
      target: this,
    });
    this.eventEmitter.emit("clear", event);
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
}

export default TraceableMap;
