import type nx from "../types/Nexo.js";
import NexoEvent from "../events/NexoEvent.js";
import NexoEmitter from "../events/NexoEmitter.js";

class NexoMap<Target extends nx.traceable> extends Map<
  string,
  WeakRef<Target>
> {
  private _release: boolean;
  private releaseKey: string;
  readonly events: NexoEmitter;

  constructor() {
    super();
    this._release = false;
    this.events = new NexoEmitter();
  }

  set(key: string, value: WeakRef<Target>): this {
    super.set(key, value);

    const event = new NexoEvent("map.set", {
      target: this,
      data: { key, value },
    });

    this.events.emit(event.name, event);

    return this;
  }

  delete(key: string): boolean {
    const existed = super.delete(key);

    const event = new NexoEvent("map.delete", {
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

    const event = new NexoEvent("map.clear", { target: this });
    this.events.emit(event.name, event);
  }

  release(): void {
    if (this._release) return;

    this._release = true;

    this.forEach((weakRef, key) => {
      if (weakRef.deref() === undefined) {
        this.releaseKey = key;
        this.delete(key);
        this.releaseKey = undefined;
      }
    });

    const event = new NexoEvent("map.release", { target: this });
    this.events.emit(event.name, event);

    this._release = false;
  }
}

export default NexoMap;
