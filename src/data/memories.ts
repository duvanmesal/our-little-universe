/** Shared photographs and general captions; no event dates are inferred. */
export const memories = [
  {
    id: 'long-way-home',
    image: '/images/couple/foto-04.jpg',
    title: 'A little bit of us',
    description: 'I love this little universe we share.',
    alt: 'A couple sharing a kiss outdoors.',
  },
  {
    id: 'salt-in-our-hair',
    image: '/images/couple/foto-05.jpg',
    title: 'My favorite place',
    description: 'My favorite place will always be close to you.',
    alt: 'A couple sharing a kiss indoors.',
  },
  {
    id: 'nothing-special',
    image: '/images/couple/foto-07.jpg',
    title: 'Love in the little things',
    description: 'Love lives in the smallest gestures, too.',
    alt: 'One person kissing the other on the head as they smile at the camera.',
  },
  {
    id: 'first-hello',
    image: '/images/couple/foto-01.jpg',
    title: 'You and me',
    description: 'Of all the stars, you are my favorite.',
    alt: 'Two people smiling together in a selfie.',
  },
  {
    id: 'first-meeting',
    image: '/images/couple/foto-02.jpg',
    title: 'Always with you',
    description: 'With you, even the simplest things feel special.',
    alt: 'Two people posing together in front of a brick wall.',
  },
  {
    id: 'our-beginning',
    image: '/images/couple/foto-03.jpg',
    title: 'You are my light',
    description: 'There is a light in you that makes my world brighter.',
    alt: 'A person facing the sea beneath a sunset sky.',
  },
  {
    id: 'returning-place',
    image: '/images/couple/foto-06.jpg',
    title: 'So glad we found each other',
    description: 'How lovely it is to share the world with you.',
    alt: 'Two people smiling at the camera indoors.',
  },
  {
    id: 'kitchen-dance',
    image: '/images/couple/foto-08.jpg',
    title: 'Our kind of joy',
    description: 'Your smile brings a little more color to everything.',
    alt: 'Two people making peace signs under violet lighting.',
  },
  {
    id: 'quiet-morning',
    image: '/images/couple/foto-09.jpg',
    title: 'A universe with you',
    description: 'May we always keep choosing each other.',
    alt: 'Two people looking at the camera together under violet lighting.',
  },
] as const;

export type Memory = (typeof memories)[number];
export type MemoryId = Memory['id'];
