---
title: Creating a Proxy
hide_table_of_contents: false
---

## Using an Object as Target

When you pass a regular object to `nexo.create`, it will always return a new proxy, even if the same target object is reused. This ensures that each proxy instance is unique and independently observable.

```typescript
import { Nexo } from "nexos";

const nexo = new Nexo();
const target = { foo: "example" };

// Two separate proxy instances from the same target
const proxy1 = nexo.create(target);
const proxy2 = nexo.create(target);

console.log(proxy1 === proxy2); // false — each call creates a new proxy
console.log(proxy1.foo); // "example" — proxies still reflect the original target
console.log(proxy2.foo); // "example"
```

> Even though `proxy1` and `proxy2` wrap the same object, they are distinct proxies. This design avoids unexpected side effects when tracking or emitting events per proxy instance.

---

## Using a Virtual Target

Creating a proxy without a target generates an independent virtual object that behaves like an empty container.

```typescript
import { Nexo } from "nexos";

const nexo = new Nexo();
const proxy = nexo.create();

proxy.foo = "example";

console.log(proxy.foo); // prints "example"
console.log(proxy.bar); // creates a new proxy
```

---

## Using Named References

Proxies can be referenced by a name, allowing them to be retrieved later by that identifier.

```typescript
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

```typescript
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
