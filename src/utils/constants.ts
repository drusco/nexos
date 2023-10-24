const NO_BREAK: string = "⁠";
const FUNCTION_TARGET: string = `${NO_BREAK}function`;
const IS_PROXY_ID_REGEXP: RegExp = new RegExp(`^${NO_BREAK}\\d+$`);
const HAS_PROXY_ID_REGEXP: RegExp = new RegExp(`(${NO_BREAK}\\d+)`, "g");

export default {
  IS_PROXY_ID_REGEXP,
  HAS_PROXY_ID_REGEXP,
  FUNCTION_TARGET,
  NO_BREAK,
};
