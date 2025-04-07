---
title: "proxy.getOwnPropertyDescriptor"
hide_table_of_contents: false
---

Type: [`ProxyEvent`](/docs/api/classes/ProxyEvent)

Fired when metadata about a property is requested.

```javascript
const proxy = nexo.create({ id: 42 });

nexo.on("proxy.getOwnPropertyDescriptor", (event) => {
  console.log(`Descriptor requested for: ${event.data.property}`);
});

Object.getOwnPropertyDescriptor(proxy, "id");
// Logs: Descriptor requested for: id
```
