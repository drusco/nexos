import { EventEmitter } from "events";

declare namespace Emulator {
  interface EmulatorClass extends EventEmitter {}

  interface options {
    [x: string]: unknown;
  }

  interface group {
    length: number;
    rootProxy: proxy;
  }

  interface bindings {
    [namespace: string]: group;
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

  interface itemPublicData {
    id: number;
    target?: unknown;
  }

  interface item extends itemPublicData {
    dummy: proxy;
    origin?: origin | undefined;
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

  type traceable = any;
}

export default Emulator;
