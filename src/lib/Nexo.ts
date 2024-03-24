import NexoTS from "./types/Nexo.js";
import EventEmitter from "events";
import NexoEvent from "./events/NexoEvent.js";

class Nexo<T extends NexoTS.traceable> extends EventEmitter {
  readonly entries: Map<string, WeakRef<T>> = new Map();
  readonly links: Map<string, WeakRef<T>> = new Map();
  private _release: boolean = false;

  constructor() {
    super();
  }

  set(id: string, target: T): T {
    this.entries.set(id, new WeakRef(target));

    const event = new NexoEvent("nx.create", this, { id, target });
    this.emit(event.name, event);

    return target;
  }

  delete(id: string): boolean {
    const event = new NexoEvent("nx.delete", this, { id });
    const removed = this.entries.delete(id);
    this.emit(event.name, event);

    return removed;
  }

  link(id: string, target: T): T {
    this.links.set(id, new WeakRef(target));

    const event = new NexoEvent("nx.link", this, { id, target });
    this.emit(event.name, event);

    return target;
  }

  unlink(id: string): boolean {
    const event = new NexoEvent("nx.unlink", this, { id });
    const removed = this.links.delete(id);
    this.emit(event.name, event);

    return removed;
  }

  clear(): void {
    this.entries.clear();
    this.links.clear();
    const event = new NexoEvent("nx.clear", this);
    this.emit(event.name, event);
  }

  release(): void {
    if (this._release) return;

    this._release = true;

    this.links.forEach((wref: WeakRef<T>, id: string) => {
      if (wref.deref() === undefined) {
        this.unlink(id);
      }
    });

    this.entries.forEach((wref: WeakRef<T>, id: string) => {
      if (wref.deref() === undefined) {
        this.delete(id);
      }
    });

    const event = new NexoEvent("nx.release", this, {
      links: this.links.size,
      entries: this.entries.size,
    });

    this.emit(event.name, event);

    this._release = false;
  }
}

export default Nexo;
