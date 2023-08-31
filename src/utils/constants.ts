import Exotic from "../types/Exotic.js";

const CONFIG: Exotic.emulator.options = {
  traceErrors: false,
  stackTraceLimit: 3,
};

const IS_PROXY_ID_REGEXP = /^⁠\d+$/;
const HAS_PROXY_ID_REGEXP = /(⁠\d+)/g;

export default { CONFIG, IS_PROXY_ID_REGEXP, HAS_PROXY_ID_REGEXP };
