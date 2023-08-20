import Exotic from "../../types/Exotic.js";
import { decode as decodeValue } from "../../utils/index.js";

export default function decode(scope: Exotic.Emulator, value: any): any {
  return decodeValue(scope, value);
}
