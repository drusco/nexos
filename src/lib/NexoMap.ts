import Nexo from "./Nexo.js";
import NexoEvent from "./events/NexoEvent.js";

class NexoMap<T extends object> extends Map {
  private nexo: Nexo<T>;
  private _release: boolean = false;

  constructor(nexo: Nexo<T>) {
    super();
    this.nexo = nexo;
  }

  set(key: string, value: T): this {
    super.set(key, new WeakRef(value));

    const event = new NexoEvent("nx.map.set", this, { id: key, target: value });
    this.nexo.emit(event.name, event);

    return this;
  }

  delete(key: string): boolean {
    const existed = super.delete(key);

    const event = new NexoEvent("nx.map.delete", this, { id: key });
    this.nexo.emit(event.name, event);

    return existed;
  }

  clear(): void {
    super.clear();

    const event = new NexoEvent("nx.map.clear", this);
    this.nexo.emit(event.name, event);
  }

  release(): void {
    if (this._release) return;

    this._release = true;

    this.forEach((wref: WeakRef<T>, id: string) => {
      if (wref.deref() === undefined) {
        this.delete(id);
      }
    });

    const event = new NexoEvent("nx.map.release", this);
    this.nexo.emit(event.name, event);

    this._release = false;
  }
}

export default NexoMap;
