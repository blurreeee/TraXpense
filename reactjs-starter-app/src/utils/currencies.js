// All currencies supported by the Frankfurter API (ECB-tracked)
// These are the only currencies for which live exchange rates are available.
export const CURRENCIES = [
  { code: 'AUD', name: 'Australian Dollar',     symbol: 'A$',  flag: '🇦🇺' },
  { code: 'BRL', name: 'Brazilian Real',         symbol: 'R$',  flag: '🇧🇷' },
  { code: 'CAD', name: 'Canadian Dollar',        symbol: 'CA$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc',            symbol: 'Fr',  flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan',           symbol: '¥',   flag: '🇨🇳' },
  { code: 'CZK', name: 'Czech Koruna',           symbol: 'Kč',  flag: '🇨🇿' },
  { code: 'DKK', name: 'Danish Krone',           symbol: 'kr',  flag: '🇩🇰' },
  { code: 'EUR', name: 'Euro',                   symbol: '€',   flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound',          symbol: '£',   flag: '🇬🇧' },
  { code: 'HKD', name: 'Hong Kong Dollar',       symbol: 'HK$', flag: '🇭🇰' },
  { code: 'HUF', name: 'Hungarian Forint',       symbol: 'Ft',  flag: '🇭🇺' },
  { code: 'IDR', name: 'Indonesian Rupiah',      symbol: 'Rp',  flag: '🇮🇩' },
  { code: 'ILS', name: 'Israeli Shekel',         symbol: '₪',   flag: '🇮🇱' },
  { code: 'INR', name: 'Indian Rupee',           symbol: '₹',   flag: '🇮🇳' },
  { code: 'ISK', name: 'Icelandic Króna',        symbol: 'kr',  flag: '🇮🇸' },
  { code: 'JPY', name: 'Japanese Yen',           symbol: '¥',   flag: '🇯🇵' },
  { code: 'KRW', name: 'South Korean Won',       symbol: '₩',   flag: '🇰🇷' },
  { code: 'MXN', name: 'Mexican Peso',           symbol: 'MX$', flag: '🇲🇽' },
  { code: 'MYR', name: 'Malaysian Ringgit',      symbol: 'RM',  flag: '🇲🇾' },
  { code: 'NOK', name: 'Norwegian Krone',        symbol: 'kr',  flag: '🇳🇴' },
  { code: 'NZD', name: 'New Zealand Dollar',     symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'PHP', name: 'Philippine Peso',        symbol: '₱',   flag: '🇵🇭' },
  { code: 'PLN', name: 'Polish Złoty',           symbol: 'zł',  flag: '🇵🇱' },
  { code: 'RON', name: 'Romanian Leu',           symbol: 'lei', flag: '🇷🇴' },
  { code: 'SEK', name: 'Swedish Krona',          symbol: 'kr',  flag: '🇸🇪' },
  { code: 'SGD', name: 'Singapore Dollar',       symbol: 'S$',  flag: '🇸🇬' },
  { code: 'THB', name: 'Thai Baht',              symbol: '฿',   flag: '🇹🇭' },
  { code: 'TRY', name: 'Turkish Lira',           symbol: '₺',   flag: '🇹🇷' },
  { code: 'USD', name: 'US Dollar',              symbol: '$',   flag: '🇺🇸' },
  { code: 'ZAR', name: 'South African Rand',     symbol: 'R',   flag: '🇿🇦' },
]

/** Lookup a currency by its code. Returns undefined if not found. */
export function getCurrency(code) {
  if (!code) return undefined
  return CURRENCIES.find(c => c.code === code.toUpperCase())
}
