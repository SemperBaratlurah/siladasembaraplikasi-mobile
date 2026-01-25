/**
 * Format large numbers to human readable format
 * Examples: 1200 -> 1.2K, 15000 -> 15K, 120000 -> 120K, 1500000 -> 1.5M
 */
export const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString('id-ID');
};

/**
 * Format number with full locale formatting (with thousand separators)
 * Examples: 1234567 -> 1.234.567
 */
export const formatNumberFull = (num: number): string => {
  return num.toLocaleString('id-ID');
};
