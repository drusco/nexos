---
title: "proxy.deleteProperty"
hide_table_of_contents: false
---

Type: [`ProxyEvent`](../../api/classes/ProxyEvent)

Triggered when a property is deleted from the proxy.

```javascript
const proxy = nexo.create({ temp: 123 });

nexo.on("proxy.deleteProperty", (event) => {
  console.log(`Deleted property: ${event.data.property}`);
});

delete proxy.temp; // Logs: Deleted property: temp
```
