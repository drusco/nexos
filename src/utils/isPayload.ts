export default function isPayload(value: any): boolean {
  if (typeof value !== "string") return false;
  if (!/^⁠\d+$/.test(value)) return false;
  return true;
}
