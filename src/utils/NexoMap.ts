import type nx from "../types/Nexo.js";
import NexoEvent from "../events/NexoEvent.js";
import NexoEmitter from "../events/NexoEmitter.js";

class NexoMap<Target extends nx.traceable> extends Map<
  string,
  WeakRef<Target>
> {
  private releaseKey: string;
  readonly events: NexoEmitter;

  constructor() {
    super();
    this.events = new NexoEmitter();
  }

  set(key: string, value: WeakRef<Target>): this {
    super.set(key, value);

    const event = new NexoEvent("set", {
      target: this,
      data: { key, value },
    });

    this.events.emit(event.name, event);

    return this;
  }

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

  clear(): void {
    super.clear();

    const event = new NexoEvent("clear", { target: this });
    this.events.emit(event.name, event);
  }

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
