export default function getSandbox(): nx.FunctionLike {
  const boundFunction = new Function().bind(null);
  const sandbox = Object.setPrototypeOf(boundFunction, null);
  // Remove function related properties for a clean state sandbox
  for (const key of Reflect.ownKeys(sandbox)) {
    const descriptor = Object.getOwnPropertyDescriptor(sandbox, key);
    if (descriptor.configurable) {
      delete sandbox[key];
    }
  }
  return sandbox;
}
