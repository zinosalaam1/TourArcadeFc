export function validatePhoneNumber(phone: string): boolean {
  // Nigerian phone number: 080XXXXXXXX or +234XXXXXXXXXX
  return /^(0|\+234)\d{10}$/.test(phone.replace(/\s/g, ''));
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}