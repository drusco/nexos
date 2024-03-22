import NexoTS from "./types/Nexo.js";
import EventEmitter from "node:events";
import { cloneAndModify } from "../utils/index.js";
import NexoEvent from "./events/NexoEvent.js";

class Nexo<T extends NexoTS.traceable> extends EventEmitter {
  readonly entries: Map<string, WeakRef<T>> = new Map();
  readonly links: Map<string, WeakRef<T>> = new Map();
  private _release: boolean = false;

  private _releaseCallback = (
    wref: WeakRef<T>,
    id: string,
    map: Map<string, WeakRef<T>>,
  ) => {
    if (wref.deref() === undefined) {
      map.delete(id);
      const event = new NexoEvent("nx.delete", this, { id });
      this.emit(event.name, event);
    }
  };

  constructor() {
    super();
  }

  static cloneAndModify(value: unknown, modify?: (value: unknown) => unknown) {
    return cloneAndModify(value, modify);
  }

  link(id: string, target: T): T {
    this.links.set(id, new WeakRef(target));

    const event = new NexoEvent("nx.link", this, { id, target });
    this.emit(event.name, event);

    return target;
  }

  unlink(id: string): boolean {
    const event = new NexoEvent("nx.unlink", this, { id });
    this.emit(event.name, event);

    return this.links.delete(id);
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

    const current = this.entries.size;

    this.entries.forEach(this._releaseCallback);
    this.links.forEach(this._releaseCallback);

    const deleted = current - this.entries.size;

    if (deleted > 0) {
      const event = new NexoEvent("nx.release", this, {
        active: this.entries.size,
        deleted,
      });
      this.emit(event.name, event);
    }

    this._release = false;
  }
}

export default Nexo;
