---
title: "proxy.isExtensible"
hide_table_of_contents: false
---

Type: [`ProxyIsExtensibleEvent`](../../api/interfaces/ProxyIsExtensibleEvent)

Fired when checking if new properties can be added to the proxy.

### Data Properties

#### target

[`Traceable`](../../api/type-aliases/Traceable)

The underlying target object.

#### result

`boolean`

Indicates whether the target object is extensible (i.e., whether new properties can be added).

### Example

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create({});

nexo.on("proxy.isExtensible", (event: nx.ProxyIsExtensibleEvent) => {
  console.log("Checking extensibility");
});

Object.isExtensible(proxy); // Logs: Checking extensibility
```
