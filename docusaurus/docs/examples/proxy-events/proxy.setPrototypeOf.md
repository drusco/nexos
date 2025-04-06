---
title: "proxy.setPrototypeOf"
hide_table_of_contents: false
---

Fired when changing the prototype with `Object.setPrototypeOf`.

```javascript
const proxy = nexo.create({});
const proto = { kind: "custom" };

nexo.on("proxy.setPrototypeOf", () => {
  console.log("Prototype being changed");
});

Object.setPrototypeOf(proxy, proto); // Logs: Prototype being changed
```
