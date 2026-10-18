export interface Song {
  title: string;
  artist: string;
  memory: string;
  src?: string;
}
/** Songs shared by Lynn and Duvan, with locally supplied audio. */
export const songs: Song[] = [
  {
    title: 'M.A.I',
    artist: 'Milo J',
    memory: 'How beautiful it was to find you.',
    src: '/audio/mai-milo-j.mp3',
  },
  {
    title: 'Francés Limón',
    artist: 'Enanitos Verdes',
    memory: 'How sweet it feels to be in love with you.',
    src: '/audio/frances-limon-enanitos-verdes.mp3',
  },
  {
    title: 'Seoul City',
    artist: 'JENNIE',
    memory: 'The song you dedicated to me.',
    src: '/audio/seoul-city-jennie.mp3',
  },
];
