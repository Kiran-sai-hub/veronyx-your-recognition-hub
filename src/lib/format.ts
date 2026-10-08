export function formatIndianNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatRupees(value: number): string {
  return `₹ ${formatIndianNumber(value)}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function isValidGstin(value: string): boolean {
  return /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value.toUpperCase());
}

export function isValidUdyam(value: string): boolean {
  return /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/.test(value.toUpperCase());
}
