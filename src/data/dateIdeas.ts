export const dateIdeas = [
  {
    title: 'A cinema for two',
    detail: 'Pick a film each, make the popcorn, and let a coin choose the first screening.',
    type: 'Stay in',
    duration: '2–3 hours',
  },
  {
    title: 'The kitchen experiment',
    detail: 'Choose one new recipe. Put on your favorite music. Make a beautiful mess.',
    type: 'Stay in',
    duration: '90 minutes',
  },
  {
    title: 'A scoop of somewhere new',
    detail: 'Find an ice cream shop you have never tried. Order a flavor for each other.',
    type: 'Head out',
    duration: '1 hour',
  },
  {
    title: 'Our little photo walk',
    detail: 'Take turns choosing a direction. Each photograph three things that remind you of us.',
    type: 'Head out',
    duration: '1–2 hours',
  },
  {
    title: 'Make something together',
    detail:
      'A drawing, a tiny shelf, a playlist. Something imperfect that did not exist yesterday.',
    type: 'Stay in',
    duration: 'An afternoon',
  },
  {
    title: 'The scenic route',
    detail: 'Walk somewhere unfamiliar. Stop whenever something catches your eye.',
    type: 'Head out',
    duration: '1 hour',
  },
  {
    title: 'A little friendly competition',
    detail: 'Bring out a board game. Winner chooses dessert. Everyone wins dessert.',
    type: 'Stay in',
    duration: '90 minutes',
  },
  {
    title: 'Meet me at golden hour',
    detail: 'Pack a blanket and a small picnic. Find a view. Stay for the last bit of light.',
    type: 'Head out',
    duration: 'An evening',
  },
];

export function chooseDateIndex(previous: number, random = Math.random()): number {
  const length = dateIdeas.length;
  if (previous < 0 || previous >= length)
    return Math.min(length - 1, Math.floor(Math.max(0, random) * length));
  const offset = 1 + Math.min(length - 2, Math.floor(Math.max(0, random) * (length - 1)));
  return (previous + offset) % length;
}
