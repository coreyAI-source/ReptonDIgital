/**
 * UTM campaign tracking. Values from the landing URL are kept for the current
 * browser tab (sessionStorage) so they survive moving between pages, and are
 * sent with the enquiry so you can see which campaign produced it.
 */

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

const STORAGE_KEY = "rd-utm";
const MAX_LENGTH = 200;

const PARAM_MAP: Array<[string, keyof UtmParams]> = [
  ["utm_source", "source"],
  ["utm_medium", "medium"],
  ["utm_campaign", "campaign"],
  ["utm_content", "content"],
  ["utm_term", "term"],
];

/** Keeps only the UTM values present in a query string, trimmed and length-limited. */
export function pickUtmParams(params: URLSearchParams): UtmParams {
  const picked: UtmParams = {};
  for (const [param, key] of PARAM_MAP) {
    const value = (params.get(param) ?? "").trim().slice(0, MAX_LENGTH);
    if (value) picked[key] = value;
  }
  return picked;
}

/** Stores UTM values for this tab when the landing URL carries any. */
export function storeUtmParams(params: URLSearchParams): void {
  const picked = pickUtmParams(params);
  if (Object.keys(picked).length === 0) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(picked));
  } catch {
    // Storage can be unavailable (for example in some private modes). Tracking still works from the URL.
  }
}

/** Reads stored UTM values, accepting only string values for known keys. */
export function readStoredUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const source = parsed as Record<string, unknown>;
    const result: UtmParams = {};
    for (const [, key] of PARAM_MAP) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) {
        result[key] = value.trim().slice(0, MAX_LENGTH);
      }
    }
    return result;
  } catch {
    return {};
  }
}
