---
title: "proxy.has"
hide_table_of_contents: false
---

Type: [`ProxyHasEvent`](../../api/interfaces/ProxyHasEvent)

Triggered when the `in` operator is used on a proxy (e.g., "key" in proxy).

### Data Properties

#### target

[`Traceable`](../../api/type-aliases/Traceable)

The underlying target object.

#### property

[`ObjectKey`](../../api/type-aliases/ObjectKey)

The property name or symbol being checked for existence.

#### result

`boolean`

Indicates whether the property exists on the target.
This is the result of the `has` trap.

### Example

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create({ loaded: true });

nexo.on("proxy.has", (event: nx.ProxyHasEvent) => {
  console.log(`Checking if '${event.data.property}' exists`);
});

console.log("loaded" in proxy); // Logs: Checking if 'loaded' exists
```
