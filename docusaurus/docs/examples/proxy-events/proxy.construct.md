---
title: "proxy.construct"
hide_table_of_contents: false
---

Fired when a proxy-wrapped constructor is called using `new`.

```javascript
function Person(name) {
  this.name = name;
}
const proxy = nexo.create(Person);

nexo.on("proxy.construct", (event) => {
  console.log("Constructor called with:", event.data.args);
});

new proxy("Alice"); // Logs: Constructor called with: [ 'Alice' ]
```
