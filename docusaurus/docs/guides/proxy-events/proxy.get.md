---
title: "proxy.get"
hide_table_of_contents: false
---

Type: [`ProxyGetEvent`](../../api/interfaces/ProxyGetEvent.md)

Fired when a property is accessed on a proxy object.

### Data Properties

#### target

[`Traceable`](../../api/type-aliases/Traceable)

The underlying target object.

#### property

[`ObjectKey`](../../api/type-aliases/ObjectKey)

The name or symbol of the property being accessed on the object.

#### result

`unknown`

The value that was retrieved when accessing the property.
If the proxy was created without a target object, this defaults to a new proxy instance.

### Example

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create({ greeting: "hello" });

nexo.on("proxy.get", (event: nx.ProxyGetEvent) => {
  console.log(`Accessed property: ${event.data.property}`);
});

console.log(proxy.greeting); // Logs: Accessed property: greeting
```
