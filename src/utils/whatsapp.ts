export function openWhatsApp(phone: string, name: string, expiryDate: string, status: string): void {
  const cleaned = phone.replace(/[\s\-().]/g, '')
  const normalized = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned

  const message =
    status === 'EXPIRED'
      ? `Hi ${name}! Your gym membership expired on ${expiryDate}. Please renew to get back on track and continue your fitness journey! 💪`
      : `Hi ${name}! Your gym membership is expiring on ${expiryDate}. Please renew to stay fit and healthy! 💪`

  window.open(`https://wa.me/${normalized}?text=${encodeURIComponent(message)}`, '_blank')
}
