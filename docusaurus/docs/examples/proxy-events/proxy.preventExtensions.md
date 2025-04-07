---
title: "proxy.preventExtensions"
hide_table_of_contents: false
---

Type: [`ProxyEvent`](/docs/api/classes/ProxyEvent)

Fired when `Object.preventExtensions` is called.

```javascript
const proxy = nexo.create({});

nexo.on("proxy.preventExtensions", () => {
  console.log("Preventing extensions");
});

Object.preventExtensions(proxy); // Logs: Preventing extensions
```
