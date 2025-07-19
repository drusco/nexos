---
title: "proxy.getPrototypeOf"
hide_table_of_contents: false
---

Type: [`ProxyGetPrototypeOfEvent`](../../api/interfaces/ProxyGetPrototypeOfEvent)

Fired when the prototype of a proxy is retrieved.

### Data Properties

#### target

[`Traceable`](../../api/type-aliases/Traceable)

The underlying target object.

#### result

`object`

The prototype of the original target object.
If the proxy was created without a target, `null` is returned.

### Example

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create({});

nexo.on("proxy.getPrototypeOf", (event: nx.ProxyGetPrototypeOfEvent) => {
  console.log("Prototype requested");
});

Object.getPrototypeOf(proxy); // Logs: Prototype requested
```
