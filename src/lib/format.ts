export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatCityCountry(city: string, country: string): string {
  return `${city}, ${country}`;
}
