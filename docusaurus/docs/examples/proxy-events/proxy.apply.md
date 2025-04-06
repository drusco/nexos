---
title: "proxy.apply"
hide_table_of_contents: false
---

Fired when a proxy-wrapped function is invoked.

```javascript
const fn = () => "called!";
const proxy = nexo.create(fn);

nexo.on("proxy.apply", (event) => {
  console.log("Function called with:", event.data.args);
});

proxy(1, 2); // Logs: Function called with: [1, 2]
```
