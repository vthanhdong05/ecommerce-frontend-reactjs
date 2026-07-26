/**
 * Parse backend date string into Date.
 *
 * Backend returns dates in TWO formats (inconsistent across records):
 *   - "DD/MM/YYYY, HH:mm:ss" (e.g., "25/07/2026, 15:07:14")
 *   - ISO-like or other locale strings that `new Date()` can parse
 *
 * `new Date("25/07/2026, 15:07:14")` is locale-dependent (may parse as May 7
 * in en-US) and silently yields "Invalid Date" for unparseable inputs.
 * We parse `DD/MM/YYYY, HH:mm:ss` explicitly and fall back to `new Date()`
 * for anything else.
 */
export function parseBackendDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  // Match "DD/MM/YYYY, HH:mm:ss" or "DD/MM/YYYY HH:mm:ss"
  const m = value.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
  );
  if (m) {
    const [, dd, mm, yyyy, hh = '0', mi = '0', ss = '0'] = m;
    const fullYear = yyyy.length === 2 ? 2000 + Number(yyyy) : Number(yyyy);
    const d = new Date(fullYear, Number(mm) - 1, Number(dd), Number(hh), Number(mi), Number(ss));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Format a backend date string as "DD/MM/YYYY HH:mm" in vi-VN.
 * Returns "—" when the value is missing or unparseable.
 */
export function formatBackendDate(value: string | Date | null | undefined): string {
  const d = parseBackendDate(value);
  if (!d) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
