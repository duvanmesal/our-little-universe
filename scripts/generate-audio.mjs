// Original, mathematically synthesized sound sketches. No sampled or licensed music.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const rate = 22050;
const seconds = 12;
mkdirSync(resolve('public/audio'), { recursive: true });
for (const [name, notes] of [
  ['the-way-home', [220, 277.18, 329.63, 440, 329.63, 277.18]],
  ['sunday-slowly', [196, 246.94, 293.66, 392, 293.66, 246.94]],
  ['under-the-same-sky', [174.61, 220, 261.63, 349.23, 261.63, 220]],
]) {
  const samples = rate * seconds;
  const out = Buffer.alloc(44 + samples * 2);
  out.write('RIFF', 0);
  out.writeUInt32LE(36 + samples * 2, 4);
  out.write('WAVEfmt ', 8);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(1, 22);
  out.writeUInt32LE(rate, 24);
  out.writeUInt32LE(rate * 2, 28);
  out.writeUInt16LE(2, 32);
  out.writeUInt16LE(16, 34);
  out.write('data', 36);
  out.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) {
    const t = i / rate;
    let value = 0;
    notes.forEach((note, n) => {
      const local = t - n * 1.45;
      if (local < 0) return;
      const envelope = (1 - Math.exp(-local * 9)) * Math.exp(-local * 0.8);
      value +=
        (Math.sin(local * note * Math.PI * 2) + 0.18 * Math.sin(local * note * Math.PI * 4)) *
        envelope *
        0.17;
    });
    const fade = Math.min(1, t / 0.5, (seconds - t) / 1.5);
    out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, value * fade)) * 32767), 44 + i * 2);
  }
  writeFileSync(resolve(`public/audio/${name}.wav`), out);
}
