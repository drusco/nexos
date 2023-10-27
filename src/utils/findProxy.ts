import Exotic from "../types/Exotic.js";
import map from "./map.js";
import isProxy from "./isProxy.js";
import isTarget from "./isTarget.js";
import isMock from "./isMock.js";

// un proxy puede ser encontrado de las siguientes maneras.
//  - value puede ser un proxy
//  - value puede ser el target de un proxy
//  - value puede ser la funcion mock de un proxy

const findProxy = (value: any): void | Exotic.Proxy => {
  if (isProxy(value)) return value;
  if (isTarget(value)) return map.targets.get(value);
  if (isMock(value)) return map.mocks.get(value);
};

export default findProxy;
