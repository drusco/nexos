---
title: "proxy.ownKeys"
hide_table_of_contents: false
---

Fired when listing all enumerable property keys.

```javascript
const proxy = nexo.create({ x: 1, y: 2 });

nexo.on("proxy.ownKeys", () => {
  console.log("Listing keys");
});

Object.keys(proxy); // Logs: Listing keys
```
