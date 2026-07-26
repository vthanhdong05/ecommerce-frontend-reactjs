/**
 * Format price to Vietnamese Dong (VND)
 * @param price - Price as number or string (Prisma Decimal returns string)
 * @returns Formatted string like "1.000.000đ"
 */
export function formatVND(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return '0đ';

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) return '0đ';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(numPrice)
    .replace('₫', '₫');
}
