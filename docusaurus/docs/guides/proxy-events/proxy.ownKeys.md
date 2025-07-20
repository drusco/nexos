---
title: "proxy.ownKeys"
hide_table_of_contents: false
---

Type: [`ProxyOwnKeysEvent`](../../api/interfaces/ProxyOwnKeysEvent)

Triggered when the proxy’s own property keys are requested—for example, via `Object.keys()`,` Object.getOwnPropertyNames()`, or `Reflect.ownKeys()`.

### Data Properties

#### target

[`Traceable`](../../api/type-aliases/Traceable)

The underlying target object.

#### result

[`ObjectKey[]`](../../api/type-aliases/ObjectKey.md)

An array of the property keys (strings or symbols) returned by the `ownKeys` trap.

### Example

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create({ x: 1, y: 2 });

nexo.on("proxy.ownKeys", (event: nx.ProxyOwnKeysEvent) => {
  console.log("Listing keys");
});

Reflect.ownKeys(proxy); // Logs: Listing keys
```
