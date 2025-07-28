import type * as nx from "../types/Nexo.js";
import ProxyEvent from "../events/ProxyEvent.js";
import ProxyError from "../errors/ProxyError.js";
import { createDeferred, resolveWith, rejectWith } from "../utils/deferred.js";

/**
 * Trap for handling `defineProperty` operations on the proxy.
 *
 * Emits a cancelable `proxy.defineProperty` event allowing listeners to:
 * - Prevent the property from being defined by calling `event.preventDefault()`
 * - Replace the property descriptor by returning a new one from the listener
 *
 * If not prevented, the descriptor is applied to the internal sandbox.
 * The trap respects standard JavaScript invariants (e.g., non-extensibility, frozen objects).
 *
 * The resolved result reflects the actual JS engine behavior (true/false),
 * while the event provides a `data.result` promise representing the expected outcome.
 */
export default function defineProperty(resolveProxy: nx.resolveProxy) {
  return (
    target: nx.Traceable,
    property: nx.ObjectKey,
    descriptor: PropertyDescriptor,
  ): boolean => {
    const [proxy, wrapper] = resolveProxy();
    const { sandbox } = wrapper;
    const extensible = Object.isExtensible(target);
    const deferred = createDeferred<nx.FunctionLike<[], boolean>>();

    const event = new ProxyEvent<nx.ProxyDefinePropertyEvent["data"]>(
      "defineProperty",
      {
        target: proxy,
        cancelable: true,
        data: {
          target: sandbox || target,
          property,
          descriptor,
          result: deferred.promise,
        },
      },
    ) as nx.ProxyDefinePropertyEvent;

    // If event prevented, try to define with event.returnValue or return false
    if (event.defaultPrevented) {
      if (!event.returnValue) {
        return resolveWith(deferred.resolve, false);
      }
      try {
        if (
          !Reflect.defineProperty(
            sandbox ? sandbox : target,
            property,
            event.returnValue,
          )
        ) {
          throw TypeError(
            `Cannot define property '${String(property)}' on proxy target`,
          );
        }
        return resolveWith(deferred.resolve, true);
      } catch (error) {
        return rejectWith(
          deferred.resolve,
          new ProxyError(error.message, proxy),
        );
      }
    }

    // If no sandbox, define directly on target
    if (!sandbox) {
      try {
        if (!Reflect.defineProperty(target, property, descriptor)) {
          throw TypeError(
            `Cannot define property '${String(property)}' on proxy target`,
          );
        }
        return resolveWith(deferred.resolve, true);
      } catch (error) {
        return rejectWith(
          deferred.resolve,
          new ProxyError(error.message, proxy),
        );
      }
    }

    // If target is not extensible
    if (!extensible) {
      try {
        if (!Reflect.defineProperty(target, property, descriptor)) {
          throw TypeError(
            `Cannot define property '${String(property)}', object is not extensible`,
          );
        }
        return resolveWith(deferred.resolve, true);
      } catch (error) {
        return rejectWith(
          deferred.resolve,
          new ProxyError(error.message, proxy),
        );
      }
    }

    const configurable = descriptor.configurable ?? true;
    const isNonConfigurable = configurable === false;
    const sandboxDescriptor = Reflect.getOwnPropertyDescriptor(
      sandbox,
      property,
    );

    // Don't allow making configurable property non-configurable
    if (
      sandboxDescriptor &&
      sandboxDescriptor.configurable &&
      isNonConfigurable
    ) {
      return rejectWith(
        deferred.resolve,
        new ProxyError(
          `Cannot define non-configurable property '${String(property)}' that is configurable on the sandbox`,
          proxy,
        ),
      );
    }

    // validate the property descriptor
    if (
      !("value" in descriptor || "get" in descriptor || "set" in descriptor) &&
      isNonConfigurable
    ) {
      return rejectWith(
        deferred.resolve,
        new ProxyError(
          `Cannot define non-configurable property '${String(property)}' without a value, get, or set`,
          proxy,
        ),
      );
    }

    // Define on sandbox
    try {
      if (!Reflect.defineProperty(sandbox, property, descriptor)) {
        throw TypeError(
          `Cannot define property '${String(property)}' on proxy sandbox`,
        );
      }
      return resolveWith(deferred.resolve, configurable);
    } catch (error) {
      return rejectWith(deferred.resolve, new ProxyError(error.message, proxy));
    }
  };
}
