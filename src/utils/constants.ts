const PAYLOAD_PREFIX: string = "⁠";

const IS_PAYLOAD: RegExp = new RegExp(`^${PAYLOAD_PREFIX}.+$`, "i");

const HAS_PAYLOAD: RegExp = new RegExp(`(${PAYLOAD_PREFIX}.+)`, "gi");

export { IS_PAYLOAD, HAS_PAYLOAD, PAYLOAD_PREFIX };
