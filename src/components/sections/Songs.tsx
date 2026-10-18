import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { songs } from '../../data/songs';
const volumeKey = 'our-little-universe:volume:v1';

export default function Songs() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [volume, setVolume] = useState(0.7);
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(volumeKey));
      if (localStorage.getItem(volumeKey) !== null && saved >= 0 && saved <= 1) setVolume(saved);
    } catch {
      /* Storage is optional. */
    }
  }, []);
  function changeVolume(value: number) {
    setVolume(value);
    if (audio.current) audio.current.volume = value;
    try {
      localStorage.setItem(volumeKey, String(value));
    } catch {
      /* Keep this visit functional without storage. */
    }
  }
  useEffect(
    () => () => {
      audio.current?.pause();
      audio.current = null;
    },
    [],
  );
  async function play(index: number) {
    const song = songs[index]!;
    if (playing === index) {
      audio.current?.pause();
      setPlaying(null);
      return;
    }
    audio.current?.pause();
    setPlaying(null);
    setMessage('');
    if (!song.src) {
      setMessage('This memory is waiting for its music.');
      return;
    }
    const next = new Audio(song.src);
    next.volume = volume;
    audio.current = next;
    next.onended = () => setPlaying(null);
    try {
      await next.play();
      if (audio.current === next) setPlaying(index);
      else next.pause();
    } catch {
      setMessage('This track could not be played. Try another song.');
    }
  }
  return (
    <div>
      <div className="song-list">
        {songs.map((song, i) => (
          <article className={`song ${playing === i ? 'playing' : ''}`} key={song.title}>
            <button
              className="record"
              aria-label={`${playing === i ? 'Pause' : 'Play'} ${song.title}`}
              onClick={() => void play(i)}
            >
              <span>{playing === i ? 'Ⅱ' : '▷'}</span>
            </button>
            <div className="song-info">
              <h3>{song.title}</h3>
              <span className="small-meta">
                {song.artist}
                {playing === i && (
                  <span className="now-playing">
                    <span className="eq" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                    Now playing
                  </span>
                )}
              </span>
              <p>{song.memory}</p>
            </div>
          </article>
        ))}
      </div>
      <label
        className="volume"
        style={{ '--level': `${Math.round(volume * 100)}%` } as CSSProperties}
      >
        <span className="small-meta">Volume</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          aria-label="Volume"
          aria-valuetext={`${Math.round(volume * 100)}%`}
          onChange={(e) => changeVolume(e.currentTarget.valueAsNumber)}
        />
      </label>
      <p className="quiet-note">Three songs. A little soundtrack of us.</p>
      <p role="status" className="quiet-note">
        {message}
      </p>
    </div>
  );
}
