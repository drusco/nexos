const PAYLOAD_PREFIX: string = "⁠";

const UUID_REGEXP =
  "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

const IS_UUID_PAYLOAD: RegExp = new RegExp(
  `^${PAYLOAD_PREFIX + UUID_REGEXP}$`,
  "i",
);

const HAS_UUID_PAYLOAD: RegExp = new RegExp(
  `(${PAYLOAD_PREFIX + UUID_REGEXP})`,
  "gi",
);

export { IS_UUID_PAYLOAD, HAS_UUID_PAYLOAD, PAYLOAD_PREFIX };
