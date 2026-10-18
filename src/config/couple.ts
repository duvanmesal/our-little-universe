/** Shared identity and relationship date for Lynn and Duvan. */
export const couple = {
  names: ['Lynn', 'Duvan'] as const,
  startDate: '2025-04-14',
  title: 'Our Little Universe',
  intro: ['Every story begins somewhere.', 'Ours began among billions of possibilities.'],
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
