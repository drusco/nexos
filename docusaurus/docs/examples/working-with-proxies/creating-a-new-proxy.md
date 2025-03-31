---
title: Creating a Proxy
hide_table_of_contents: false
---

## With a Target Object

Creating a proxy from an existing object returns the same proxy when called multiple times with the same target.

```javascript
import { Nexo } from "nexos";

const nexo = new Nexo();
const target = { foo: "example" };

const proxy = nexo.create(target);
const copy = nexo.create(target);

console.log(proxy === copy); // prints true
console.log(proxy.foo); // prints "example"
```

---

## With a Virtual Target

Creating a proxy without a target generates an independent virtual object that behaves like an empty container.

```javascript
import { Nexo } from "nexos";

const nexo = new Nexo();
const proxy = nexo.create();
const newProxy = nexo.create();

proxy.foo = "example";

console.log(proxy.foo); // prints "example"
console.log(proxy.bar); // prints new proxy
console.log(proxy === newProxy); // prints false
```

---

## Using Named References

Proxies can be referenced by a name, allowing them to be retrieved later by that identifier.

```javascript
import { Nexo } from "nexos";

const nexo = new Nexo();
const target = {};
const proxy = nexo.use("foo", target);
const proxyByName = nexo.use("foo");

console.log(proxy === proxyByName); // true
```

---

## Updating a Proxy Target

A named reference can be reassigned to a different target, making the new proxy distinct from the original.

```javascript
import { Nexo } from "nexos";

const nexo = new Nexo();
const foo = {};
const bar = {};

const fooProxy = nexo.use("foo", foo);
const barProxy = nexo.use("foo", bar);

const proxy = nexo.use("foo");

console.log(fooProxy === barProxy); // false
console.log(proxy === barProxy); // true
```
