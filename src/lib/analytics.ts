export function trackRegistration(playerName: string, amount: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'registration', {
      event_category: 'tournament',
      event_label: playerName,
      value: amount,
    });
  }
}