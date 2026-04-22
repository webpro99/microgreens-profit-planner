/**
 * Unit normalization & conversion system
 *
 * Rule: Everything is stored & calculated in BASE units per category.
 * Display layer converts to the user's preferred unit.
 *
 * Base units:
 *  - Weight       → grams (g)
 *  - Volume       → milliliters (mL)
 *  - Length       → centimeters (cm)
 *  - Area         → square meters (m²)
 *  - Temperature  → Celsius (°C)
 *  - Currency     → MAD (Moroccan Dirham)
 *  - Energy       → watt-hour (Wh)
 */

export type UnitCategory =
  | "weight"
  | "volume"
  | "length"
  | "area"
  | "temperature"
  | "currency"
  | "energy";

export const BASE_UNIT: Record<UnitCategory, string> = {
  weight: "g",
  volume: "mL",
  length: "cm",
  area: "m2",
  temperature: "C",
  currency: "MAD",
  energy: "Wh",
};

/**
 * Linear conversion factors → multiply by factor to get BASE unit.
 * (Temperature & currency handled separately because they aren't simple ratios.)
 */
export const CONVERSION_FACTORS: Record<string, { category: UnitCategory; toBase: number; label: string }> = {
  // Weight → grams
  g:   { category: "weight", toBase: 1,        label: "grams" },
  kg:  { category: "weight", toBase: 1000,     label: "kilograms" },
  mg:  { category: "weight", toBase: 0.001,    label: "milligrams" },
  oz:  { category: "weight", toBase: 28.3495,  label: "ounces" },
  lb:  { category: "weight", toBase: 453.592,  label: "pounds" },

  // Volume → milliliters
  mL:  { category: "volume", toBase: 1,        label: "milliliters" },
  L:   { category: "volume", toBase: 1000,     label: "liters" },
  gal: { category: "volume", toBase: 3785.41,  label: "gallons (US)" },
  floz:{ category: "volume", toBase: 29.5735,  label: "fluid ounces" },

  // Length → centimeters
  cm:  { category: "length", toBase: 1,        label: "centimeters" },
  mm:  { category: "length", toBase: 0.1,      label: "millimeters" },
  m:   { category: "length", toBase: 100,      label: "meters" },
  in:  { category: "length", toBase: 2.54,     label: "inches" },
  ft:  { category: "length", toBase: 30.48,    label: "feet" },

  // Area → square meters
  m2:  { category: "area", toBase: 1,          label: "square meters" },
  cm2: { category: "area", toBase: 0.0001,     label: "square centimeters" },
  ha:  { category: "area", toBase: 10000,      label: "hectares" },
  ft2: { category: "area", toBase: 0.092903,   label: "square feet" },

  // Energy → watt-hours
  Wh:  { category: "energy", toBase: 1,        label: "watt-hours" },
  kWh: { category: "energy", toBase: 1000,     label: "kilowatt-hours" },
  J:   { category: "energy", toBase: 1/3600,   label: "joules" },
};

/**
 * Currency exchange rates → multiply by rate to get MAD.
 * Update these from an FX feed if needed; for now they are static defaults.
 */
export const CURRENCY_TO_MAD: Record<string, number> = {
  MAD: 1,
  USD: 10.0,
  EUR: 10.8,
  GBP: 12.6,
};

/* ------------------------------------------------------------------ */
/*  Core conversion API                                                */
/* ------------------------------------------------------------------ */

/** Convert a value from `unit` into the BASE unit of its category. */
export function toBase(value: number, unit: string): number {
  if (unit === "C" || unit === "F" || unit === "K") {
    return tempToCelsius(value, unit as "C" | "F" | "K");
  }
  if (unit in CURRENCY_TO_MAD) {
    return value * CURRENCY_TO_MAD[unit];
  }
  const f = CONVERSION_FACTORS[unit];
  if (!f) throw new Error(`Unknown unit: ${unit}`);
  return value * f.toBase;
}

/** Convert a value already in the BASE unit into a target display `unit`. */
export function fromBase(baseValue: number, unit: string): number {
  if (unit === "C" || unit === "F" || unit === "K") {
    return celsiusTo(baseValue, unit as "C" | "F" | "K");
  }
  if (unit in CURRENCY_TO_MAD) {
    return baseValue / CURRENCY_TO_MAD[unit];
  }
  const f = CONVERSION_FACTORS[unit];
  if (!f) throw new Error(`Unknown unit: ${unit}`);
  return baseValue / f.toBase;
}

/** Convert directly between two units in the same category. */
export function convert(value: number, from: string, to: string): number {
  return fromBase(toBase(value, from), to);
}

/* ------------------------------------------------------------------ */
/*  Temperature (non-linear)                                           */
/* ------------------------------------------------------------------ */

function tempToCelsius(value: number, unit: "C" | "F" | "K"): number {
  if (unit === "C") return value;
  if (unit === "F") return (value - 32) * (5 / 9);
  return value - 273.15; // Kelvin
}

function celsiusTo(c: number, unit: "C" | "F" | "K"): number {
  if (unit === "C") return c;
  if (unit === "F") return c * (9 / 5) + 32;
  return c + 273.15;
}

/* ------------------------------------------------------------------ */
/*  Display helpers                                                    */
/* ------------------------------------------------------------------ */

const UNIT_SYMBOL: Record<string, string> = {
  g: "g", kg: "kg", mg: "mg", oz: "oz", lb: "lb",
  mL: "mL", L: "L", gal: "gal", floz: "fl oz",
  cm: "cm", mm: "mm", m: "m", in: "in", ft: "ft",
  m2: "m²", cm2: "cm²", ha: "ha", ft2: "ft²",
  C: "°C", F: "°F", K: "K",
  Wh: "Wh", kWh: "kWh", J: "J",
  MAD: "MAD", USD: "$", EUR: "€", GBP: "£",
};

/** Format a base-unit value for display in the user's preferred unit. */
export function formatUnit(
  baseValue: number,
  displayUnit: string,
  opts: { decimals?: number } = {}
): string {
  const { decimals = 2 } = opts;
  const v = fromBase(baseValue, displayUnit);
  const symbol = UNIT_SYMBOL[displayUnit] ?? displayUnit;
  const num = Number.isFinite(v) ? v.toFixed(decimals) : "0";
  // Currency: symbol-first for $, €, £; suffix for MAD
  if (displayUnit === "USD" || displayUnit === "EUR" || displayUnit === "GBP") {
    return `${symbol}${num}`;
  }
  if (displayUnit === "MAD") return `${num} MAD`;
  return `${num} ${symbol}`;
}

/** Format a MAD value for display (default currency). */
export function formatMAD(amount: number, decimals = 2): string {
  return `${amount.toFixed(decimals)} MAD`;
}

/** List the available units for a given category — useful for selects. */
export function unitsForCategory(category: UnitCategory): { value: string; label: string }[] {
  if (category === "currency") {
    return Object.keys(CURRENCY_TO_MAD).map((k) => ({ value: k, label: k }));
  }
  if (category === "temperature") {
    return [
      { value: "C", label: "°C" },
      { value: "F", label: "°F" },
      { value: "K", label: "K" },
    ];
  }
  return Object.entries(CONVERSION_FACTORS)
    .filter(([, v]) => v.category === category)
    .map(([k, v]) => ({ value: k, label: `${UNIT_SYMBOL[k] ?? k} — ${v.label}` }));
}
