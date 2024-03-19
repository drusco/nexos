const NO_BREAK: string = "⁠";

const UUID_REGEXP =
  "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

const IS_PROXY_ID_REGEXP: RegExp = new RegExp(
  `^${NO_BREAK + UUID_REGEXP}$`,
  "i",
);

const HAS_PROXY_ID_REGEXP: RegExp = new RegExp(
  `(${NO_BREAK + UUID_REGEXP})`,
  "gi",
);

export default {
  IS_PROXY_ID_REGEXP,
  HAS_PROXY_ID_REGEXP,
  NO_BREAK,
};
