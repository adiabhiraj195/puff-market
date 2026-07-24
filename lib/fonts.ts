// Mock Next.js Google Fonts to enable 100% offline builds and prevent compilation errors
export function Staatliches(options?: any) {
  return {
    className: "font-staatliches",
    style: { fontFamily: "'Staatliches', sans-serif" }
  };
}

export function Outfit(options?: any) {
  return {
    className: "font-outfit",
    style: { fontFamily: "'Outfit', sans-serif" }
  };
}
