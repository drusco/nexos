let counter = 0;

export default function generateId() {
  return (++counter + Date.now()).toString(36).toUpperCase();
}
