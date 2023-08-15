export default function isPayload(value: any): boolean {
  if (!Array.isArray(value)) return false;
  if (!value.length || value.length > 2) return false;
  const [noBreak] = value;
  if (noBreak !== "⁠") return false;
  return true;
}
