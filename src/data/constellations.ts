import type { MemoryId } from './memories';

export interface ConstellationStar {
  id: string;
  memoryId: MemoryId;
  position: [number, number];
}
export interface ConstellationChapter {
  id: string;
  title: string;
  figure: string;
  description: string;
  closingLine: string;
  tone: 'gold' | 'ice' | 'lavender';
  bends: Record<string, [number, number][]>;
  stars: ConstellationStar[];
  connections: [string, string][];
}

/** Photo chapters. Coordinates are percentages of the sky, shared by WebGL and SVG. */
export const constellations: ConstellationChapter[] = [
  {
    id: 'beginning',
    title: 'The beginning',
    figure: 'Cassiopeia · The W',
    tone: 'gold',
    description: 'Five stars, one unmistakable W. A little celebration of how we found each other.',
    closingLine: 'A hello, a moment, a little future. And suddenly, there was us.',
    stars: [
      { id: 'hello', memoryId: 'first-hello', position: [17, 28] },
      { id: 'meeting', memoryId: 'first-meeting', position: [50, 36] },
      { id: 'future', memoryId: 'our-beginning', position: [83, 24] },
    ],
    bends: { 'hello:meeting': [[33, 72]], 'meeting:future': [[68, 68]] },
    connections: [
      ['hello', 'meeting'],
      ['meeting', 'future'],
    ],
  },
  {
    id: 'places',
    title: 'Places we keep',
    figure: 'Ursa Minor · The little dipper',
    tone: 'ice',
    description: 'A handle and a bowl, pointing us back to the places we keep.',
    closingLine: 'Home was never just a place. It was who we found beside us.',
    stars: [
      { id: 'road', memoryId: 'long-way-home', position: [17, 22] },
      { id: 'sea', memoryId: 'salt-in-our-hair', position: [56, 49] },
      { id: 'return', memoryId: 'returning-place', position: [80, 75] },
    ],
    bends: {
      'road:sea': [
        [30, 26],
        [43, 36],
      ],
      'sea:return': [[83, 43]],
      'return:sea': [[57, 78]],
    },
    connections: [
      ['road', 'sea'],
      ['sea', 'return'],
      ['return', 'sea'],
    ],
  },
  {
    id: 'ordinary',
    title: 'Ordinary magic',
    figure: 'Corona Borealis · The crown',
    tone: 'lavender',
    description: 'An open crown of stars, made of our smallest, brightest moments.',
    closingLine: 'Nothing extraordinary had to happen. We were already there.',
    stars: [
      { id: 'rain', memoryId: 'nothing-special', position: [18, 26] },
      { id: 'dance', memoryId: 'kitchen-dance', position: [50, 72] },
      { id: 'morning', memoryId: 'quiet-morning', position: [82, 26] },
    ],
    bends: {
      'rain:dance': [
        [23, 49],
        [35, 65],
      ],
      'dance:morning': [
        [65, 65],
        [77, 49],
      ],
    },
    connections: [
      ['rain', 'dance'],
      ['dance', 'morning'],
    ],
  },
];

export const starKey = (chapterId: string, starId: string) => `${chapterId}:${starId}`;

/** One silhouette for the solar sky, the interactive atlas, and the SVG fallback. */
export function connectionPoints(
  chapter: ConstellationChapter,
  edge: [string, string],
): [number, number][] {
  return [
    chapter.stars.find((star) => star.id === edge[0])!.position,
    ...(chapter.bends[edge.join(':')] ?? []),
    chapter.stars.find((star) => star.id === edge[1])!.position,
  ];
}
const knownStars = new Set(constellations.flatMap((c) => c.stars.map((s) => starKey(c.id, s.id))));

export function parseStarProgress(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? '[]');
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter((id): id is string => typeof id === 'string' && knownStars.has(id)),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}

export function connectionRevealed(
  chapter: ConstellationChapter,
  connection: [string, string],
  visited: readonly string[],
) {
  return connection.every((id) => visited.includes(starKey(chapter.id, id)));
}

/** Replay only this chapter; other chapters keep their discoveries. */
export function resetChapterProgress(visited: readonly string[], chapterId: string): string[] {
  return visited.filter((id) => !id.startsWith(`${chapterId}:`));
}
