import Exotic from "../../types/Exotic.js";
import { findProxy, encode } from "../../utils/index.js";

export default function get(
  scope: Exotic.Emulator,
  ...args: any[]
): Promise<any> {
  const values = args.map(findProxy);

  return new Promise((resolve) => {
    if (!args.length) {
      return resolve(undefined);
    }
    const payload = args.length > 1 ? values : values[0];

    scope.emit("get", encode(payload), (result: any) => {
      resolve(result);
    });
  });
}
