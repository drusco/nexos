import Nexo from "./types/Nexo.js";
import NexoEvent from "./events/NexoEvent.js";
import EventEmitter from "events";

class NexoMap<Target extends Nexo.traceable> extends Map<
  string,
  WeakRef<Target>
> {
  private _release: boolean;
  private releaseKey: string;
  readonly events: EventEmitter;

  constructor() {
    super();
    this._release = false;
    this.events = new EventEmitter();
  }

  set(key: string, value: WeakRef<Target>): this {
    super.set(key, value);

    const event = new NexoEvent("nx.map.set", this, { key, value });
    this.events.emit(event.name, event);

    return this;
  }

  delete(key: string): boolean {
    const existed = super.delete(key);

    const event = new NexoEvent("nx.map.delete", this, {
      key,
      released: this.releaseKey === key,
    });

    this.events.emit(event.name, event);

    return existed;
  }

  clear(): void {
    super.clear();

    const event = new NexoEvent("nx.map.clear", this);
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

    const event = new NexoEvent("nx.map.release", this);
    this.events.emit(event.name, event);

    this._release = false;
  }
}

export default NexoMap;
