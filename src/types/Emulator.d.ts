import { EventEmitter } from "events";

declare namespace Emulator {
  interface EmulatorClass extends EventEmitter {
    isTraceable(value: any): boolean;
  }

  interface options {
    [x: string]: unknown;
  }

  interface group {
    length: number;
    rootProxy: proxy;
  }

  interface bindings {
    [id: string]: group;
  }

  interface private {
    options: options;
    bindings: bindings;
    itemCount: number;
    activeItems: number;
    groupCount: number;
  }

  interface origin {
    action: "get" | "set" | "construct" | "apply";
    item: unknown;
    key?: string;
    value?: unknown;
    that?: unknown;
    args?: unknown[];
  }

  interface item {
    id: number;
    dummy: proxy;
    origin?: origin;
    target: traceable;
    revoke(): void;
    scope: EmulatorClass;
    sandbox: object;
    group?: string;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  interface proxy extends Function {
    (...args: any[]): void;
    [x: string]: any;
  }

  type traceable = object | proxy;
}

export default Emulator;
