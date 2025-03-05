import type * as nx from "../types/Nexo.js";
import map from "./maps.js";
import isProxy from "./isProxy.js";
import isTraceable from "./isTraceable.js";

const findProxy = (value: unknown): void | nx.Proxy => {
  // checks whether the value is a proxy or not
  if (isProxy(value)) return value;
  // traceable values may be linked to a proxy
  if (isTraceable(value)) return map.tracables.get(value);
};

export default findProxy;
