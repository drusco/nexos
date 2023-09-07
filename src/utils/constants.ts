const NO_BREAK = "⁠";
const IS_PROXY_ID_REGEXP = new RegExp(`^${NO_BREAK}\\d+$`);
const HAS_PROXY_ID_REGEXP = new RegExp(`(${NO_BREAK}\\d+)`, "g");
const FUNCTION_TARGET = `${NO_BREAK}function`;

export default {
  IS_PROXY_ID_REGEXP,
  HAS_PROXY_ID_REGEXP,
  FUNCTION_TARGET,
  NO_BREAK,
};
