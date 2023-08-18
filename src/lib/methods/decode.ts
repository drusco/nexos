import Exotic from "../../types/Exotic";
import { decode as decodeValue } from "../../utils";

export default function decode(scope: Exotic.Emulator, value: any): any {
  return decodeValue(scope, value);
}
