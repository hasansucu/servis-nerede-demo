export function formatTL(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('TRY', 'TL');
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('tr-TR').format(num);
}
