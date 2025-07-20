---
title: "proxy.deleteProperty"
hide_table_of_contents: false
---

Type: [`ProxyDeletePropertyEvent`](../../api/interfaces/ProxyDeletePropertyEvent)

Triggered when a property is deleted from the proxy.

> This event is **cancelable**, meaning its default behavior can be prevented.
> By calling `event.preventDefault()`, you can override or block the underlying operation.
> This allows you to intercept and customize how the proxy responds to this operation.

### Data Properties

#### target

[`Traceable`](../../api/type-aliases/Traceable)

The underlying target object.

#### property

[`ObjectKey`](../../api/type-aliases/ObjectKey.md)

The name or symbol of the property being deleted.

### Example

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create({ temp: 123 });

nexo.on("proxy.deleteProperty", (event: nx.ProxyDeletePropertyEvent) => {
  console.log(`Deleted property: ${event.data.property}`);
});

delete proxy.temp; // Logs: Deleted property: temp
```
