import Exotic from "../../types/Exotic.js";
import { findProxy } from "../../utils/index.js";

export default function get(
  scope: Exotic.Emulator,
  ...args: any[]
): Promise<any[]> {
  const values = args.map(findProxy);

  return new Promise((resolve) => {
    if (!values.length) {
      return resolve([]);
    }

    scope.emit("get", scope.encode(values), (results: any[]) => {
      resolve(results);
    });
  });
}
