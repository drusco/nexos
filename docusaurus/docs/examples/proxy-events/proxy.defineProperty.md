---
title: "proxy.defineProperty"
hide_table_of_contents: false
---

Type: [`ProxyEvent`](/docs/api/classes/ProxyEvent)

Triggered when `Object.defineProperty` is used.

```javascript
const proxy = nexo.create({});

nexo.on("proxy.defineProperty", (event) => {
  console.log(`Defining property: ${event.data.property}`);
});

Object.defineProperty(proxy, "enabled", {
  value: true,
  writable: false,
});
// Logs: Defining property: enabled
```
