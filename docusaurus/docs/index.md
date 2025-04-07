---
title: Introduction
hide_table_of_contents: false
---

## Overview

Nexos is a powerful JavaScript library that simplifies the creation and management of javascript proxies. It enables dynamic access to proxy handlers through event listeners, making it easy to track and control proxy behavior. Unlike traditional proxies, Nexos allows for proxy creation with or without a target object, offering greater flexibility for various use cases.

Each proxy operation emits structured events, allowing developers to intercept, modify, or log interactions with proxied objects in real-time. Events follow a standardized naming convention: `"proxy.handler"`, where **[handler](./api/type-aliases/ProxyHandler)** corresponds to one of the built-in trap methods defined in the [MDN Proxy API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). Examples of such events include:

- `"proxy.get"` – Triggered when a property is accessed.
- `"proxy.set"` – Triggered when a property is modified.
- `"proxy.apply"` – Triggered when a proxied function is invoked.
- `"proxy.construct"` – Triggered when a proxied constructor is called.

By leveraging these events, developers gain fine-grained control over proxy interactions, enabling features like debugging, logging, and security enforcement.

## Features

Nexos offers several powerful capabilities that enhance the standard proxy API:

- **Unique ID assignment** – Each proxy instance is assigned a unique identifier, allowing easy reference and tracking.
- **Flexible targets** – Proxies can be created with or without a target object. When no target is provided, the proxy operates within an isolated sandbox.
- **Sandbox mode** – If a proxy is created without a target, it interacts with an internal sandbox object that manages property descriptors and operations separately from the global scope.
- **Weak reference tracking** – Nexos utilizes `WeakRef` to store proxies, ensuring they can be garbage collected when no longer needed, optimizing memory usage.
- **Comprehensive event system** – Every proxy operation emits an event, including handler calls (`get`, `set`, `defineProperty`), errors (`proxy.error`), and proxy creation (`proxy`). These events can be listened to either at the individual proxy level or globally through a `Nexo` instance.

## Why Use Nexos?

Nexos is particularly useful for scenarios where proxies need to be monitored, modified, or extended dynamically. Potential use cases include:

- **State management** – Track and log state changes in JavaScript applications.
- **Security enforcement** – Restrict access or modifications to sensitive objects.
- **Debugging and logging** – Capture all interactions with objects for detailed analysis.
- **Virtual objects** – Work with proxies as standalone data structures without requiring a real target.

Nexos extends the capabilities of JavaScript proxies, providing a structured, event-driven approach to working with dynamic objects. Whether you're building a reactive system, an API layer, or a debugging tool, Nexos gives you the power to manage and observe proxy interactions effortlessly.
