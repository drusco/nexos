export default function isPayload(value: any): boolean {
  if (!Array.isArray(value)) return false;
  if (!value.length || value.length > 2) return false;
  const [noBreak, proxyId] = value;
  if (noBreak !== "⁠") return false;
  if (!Number.isInteger(proxyId)) return false;
  return true;
}
