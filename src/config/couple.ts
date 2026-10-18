/** Shared identity and relationship date for Lynn and Duvan. */
export const couple = {
  names: ['Lynn', 'Duvan'] as const,
  startDate: '2025-04-14',
  title: 'Our Little Universe',
  /** «Un pequeño viaje»: one phrase per tap; the last one is where the journey arrives. */
  journey: [
    'Hay lugares a los que siempre quiero volver',
    'Algunos no aparecen en los mapas',
    'El mío eres tú',
  ],
  tagline: 'A small universe made of memories, dreams and us.',
  dedication: 'Two lives. One little universe.',
  ending: ['Our universe is still expanding.', 'And this is only the beginning.'],
  /** Set an absolute production URL to enable canonical and og:url. */
  siteUrl: '',
  /** noindex is a crawler preference, not authentication. Protect private deployments. */
  private: true,
};

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(new Date(`${date}T12:00:00Z`))
    .replaceAll('/', ' · ');
}
