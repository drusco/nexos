---
title: "proxy.getPrototypeOf"
hide_table_of_contents: false
---

Type: [`ProxyEvent`](../../api/classes/ProxyEvent)

Fired when the prototype of a proxy is retrieved.

```javascript
const proxy = nexo.create({});

nexo.on("proxy.getPrototypeOf", () => {
  console.log("Prototype requested");
});

Object.getPrototypeOf(proxy); // Logs: Prototype requested
```
