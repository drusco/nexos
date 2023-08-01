import Exotic from "../../types/Exotic";
import createProxy from "../createProxy";
import isTraceable from "../isTraceable";
import findProxy from "../findProxy";
import map from "../map";

const get = (dummy: Exotic.FunctionLike, key: string): unknown => {
  const proxy = findProxy(dummy);
  const { scope, namespace, target, sandbox } = map.proxies.get(proxy);

  const origin: Exotic.proxy.origin = {
    action: "get",
    key,
    proxy,
  };

  let protoValue: any;
  const untraceableTarget = !isTraceable(target);

  if (untraceableTarget) {
    try {
      protoValue = target[key];
    } catch (error) {
      /* empty */
    }
  }

  const sandboxKeys = Reflect.ownKeys(sandbox);
  const newSandboxKey = !sandboxKeys.includes(key); //&& !protoValue;

  if (newSandboxKey) {
    let newTarget: any;
    const valueExists = map.targets.has(target) && target[key] !== undefined;
    const traceable = !(valueExists && !isTraceable(target[key]));

    if (valueExists) newTarget = target[key];

    const value = traceable
      ? createProxy(scope, newTarget, namespace, origin)
      : newTarget;

    sandbox[key] = value;
  }

  if (key === "substring")
    console.log(2222, newSandboxKey, protoValue, sandbox[key]);

  if (protoValue) {
    //return protoValue;
  }

  return Reflect.get(sandbox, key);
};

export default get;
