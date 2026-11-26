export function personalPriceLabel(price: number): string {
  return price === 0
    ? "Безкоштовно"
    : new Intl.NumberFormat("uk-UA", {
        style: "currency",
        currency: "EUR",
      }).format(price);
}
