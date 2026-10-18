export type PlanetId = 'memories' | 'story' | 'songs' | 'adventures' | 'dreams' | 'date';
export type Destination = PlanetId | 'us';
export type Mode = 'intro' | 'explore' | 'ending' | 'constellations';
export interface PlanetData {
  id: PlanetId;
  name: string;
  shortName: string;
  description: string;
  color: string;
  darkColor: string;
  size: number;
  orbit: number;
  angle: number;
  speed: number;
  seed: number;
  rings?: boolean;
  moon?: boolean;
}
