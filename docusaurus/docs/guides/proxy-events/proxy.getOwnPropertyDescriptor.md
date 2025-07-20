---
title: "proxy.getOwnPropertyDescriptor"
hide_table_of_contents: false
---

Type: [`ProxyGetOwnPropertyDescriptorEvent`](../../api/interfaces/ProxyGetOwnPropertyDescriptorEvent)

Fired when metadata about a property is requested.

### Data Properties

#### target

[`Traceable`](../../api/type-aliases/Traceable)

The underlying target object.

#### property

[`ObjectKey`](../../api/type-aliases/ObjectKey)

The name or symbol of the property being accessed on the object.

#### descriptor

`PropertyDescriptor`

The detailed description of the property on the original target object, including attributes like `value`, `writable`, `configurable`, and `enumerable`.

### Example

```typescript
import { Nexo } from "nexos";
import type * as nx from "nexos";

const nexo = new Nexo();
const proxy = nexo.create({ id: 42 });

nexo.on(
  "proxy.getOwnPropertyDescriptor",
  (event: nx.ProxyGetOwnPropertyDescriptorEvent) => {
    console.log(`Descriptor requested for: ${event.data.property}`);
  },
);

Object.getOwnPropertyDescriptor(proxy, "id");
// Logs: Descriptor requested for: id
```
