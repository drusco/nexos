import Exotic from "../../types/Exotic";
import { findProxy, encode, map } from "../../utils";

export default async function get(
  scope: Exotic.Emulator,
  value?: any,
): Promise<any> {
  const proxy = findProxy(value);
  const { options } = map.emulators.get(scope);
  if (!proxy) return value;

  const promise = new Promise((resolve, reject) => {
    scope.emit("get", encode(value), (result: any) => {
      resolve(result);
    });
    setTimeout(reject, options.getTimeout);
  });

  const result = await promise.catch(() => {});

  return result;
}
