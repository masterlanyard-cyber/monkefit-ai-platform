const BLOCKED_PATTERNS = [
  /\bcogs\b/i,
  /internal margin/i,
  /internal profit/i,
  /minimum approved selling price/i,
  /harga pokok/i
];

export function inspectOutput(text) {
  const violations = BLOCKED_PATTERNS
    .filter((pattern) => pattern.test(text))
    .map((pattern) => pattern.toString());

  return {
    safe: violations.length === 0,
    violations
  };
}

export function safeFallback() {
  return 'Maaf, informasi tersebut merupakan data internal Monkefit dan tidak dapat saya sampaikan. Saya dapat membantu menjelaskan harga jual resmi, manfaat produk, garansi, atau opsi pembelian yang tersedia.';
}
