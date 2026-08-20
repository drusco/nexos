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
   * Native finalizer used to automatically remove entries whose `WeakRef`
   * targets have been garbage-collected. `undefined` when the runtime does
   * not support `FinalizationRegistry`.
   */
  private readonly registry =
    typeof FinalizationRegistry === "undefined"
      ? undefined
      : new FinalizationRegistry<K>((key: K) => {
          // Only remove the entry when its target is actually collected. This
          // keeps reused keys safe: if `set` overwrote the entry with a new,
          // live target, `deref()` returns it (not `undefined`) and we skip.
          if (this.get(key)?.deref() === undefined) {
            this.remove(key, true);
          }
        });

  /**
   * Persistent sweep cursor used by {@link release} to resume where the
   * previous bounded sweep left off.
   */
  private sweepCursor?: Iterator<[K, WeakRef<V>]>;

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

    // Register the target so its entry is removed automatically when the
    // target is garbage-collected.
    const target = value.deref();
    if (target && this.registry) {
      this.registry.register(target, key);
    }

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
    this.sweepCursor = undefined;

    const event = new Event("clear", {
      cancelable: false,
      target: this,
    });
    this.eventEmitter.emit("clear", event);
  }

  /**
   * Cleans up entries whose `WeakRef` targets were garbage-collected and emits
   * `delete` events for each removed entry.
   *
   * @remarks
   * Without arguments it performs a full pass, checking every entry. With a
   * `limit`, it checks at most `limit` entries per call and resumes from where
   * it left off on the next call, keeping the cost of each invocation bounded
   * and deterministic regardless of the map size.
   *
   * @param limit - Maximum number of entries to inspect per call.
   * @returns `true` while a sweep is still in progress, or `false` once a full
   * pass over the map has completed.
   */
  release(limit: number = Number.POSITIVE_INFINITY): boolean {
    let remaining = limit;

    while (remaining > 0) {
      if (!this.sweepCursor) {
        this.sweepCursor = this.entries();
      }

      const { value, done } = this.sweepCursor.next();
      if (done) {
        this.sweepCursor = undefined;
        return false;
      }

      const [key, weakRef] = value;
      if (weakRef.deref() === undefined) {
        this.remove(key, true);
      }
      remaining--;
    }

    return true;
  }
}

export default TraceableMap;
