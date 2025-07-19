---
title: "proxy.preventExtensions"
hide_table_of_contents: false
---

Type: [`ProxyPreventExtensionsEvent`](../../api/interfaces/ProxyPreventExtensionsEvent)

Triggered when `Object.preventExtensions(proxy)` is called to make the proxy (and its target) non-extensible.

### Data Properties

#### target

[`Traceable`](../../api/type-aliases/Traceable)

The underlying target object.

#### result

`boolean`

Indicates whether the operation to prevent extensions was successful.
If `true`, new properties can no longer be added to the target object.

### Example

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create({});

nexo.on("proxy.preventExtensions", (event: nx.ProxyPreventExtensionsEvent) => {
  console.log("Preventing extensions");
});

Object.preventExtensions(proxy); // Logs: Preventing extensions
```
