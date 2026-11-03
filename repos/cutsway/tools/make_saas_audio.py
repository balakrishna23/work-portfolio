"""Cutsway SaaS reel: place the ElevenLabs voiceover lines on the scene grid and duck the music under them.

    python tools/make_saas_audio.py videos/reel-saas

Reads assets/audio/vo-lines/NN.wav (trimmed, 48 kHz mono) and assets/audio/music.wav,
writes assets/audio/vo.wav and assets/audio/music-bed.wav. Times are seconds on the 128 BPM grid.
Another reel can place its own lines with assets/audio/vo-lines/lines.json: [["01", 0.3], ["02", 3.85], ...].
"""
import json
import os
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter, sosfilt

SR = 48000
LENGTH = 30.0

# (file, start s): each line starts just after its scene cut (scene starts in brackets).
LINES = [
    ("01", 0.08),   # hook [0]
    ("02", 3.15),   # drop zone [3.281], "pile" lands on the drop at 5.625
    ("03", 5.90),   # the cut [5.625]
    ("04", 8.96),   # one VOD, five drops [8.906]
    ("05", 13.20),  # plan cards [13.125]
    ("06", 18.90),  # notes + languages [18.75]
    ("07", 22.55),  # posting [22.5]
    ("08", 24.45),  # the ping returns [24.375]
    ("09", 27.00),  # cutsway.com
]


def peaking(x, f0, gain_db, q):
    a = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * f0 / SR
    alpha = np.sin(w0) / (2 * q)
    b = np.array([1 + alpha * a, -2 * np.cos(w0), 1 - alpha * a])
    den = np.array([1 + alpha / a, -2 * np.cos(w0), 1 - alpha / a])
    return lfilter(b / den[0], den / den[0], x)


def envelope(x, attack, release):
    out = np.zeros_like(x)
    a = np.exp(-1 / (attack * SR))
    r = np.exp(-1 / (release * SR))
    level = 0.0
    ax = np.abs(x)
    for i in range(len(x)):
        coef = a if ax[i] > level else r
        level = coef * level + (1 - coef) * ax[i]
        out[i] = level
    return out


def polish(vo):
    """Light touch: the ElevenLabs voice is already clean. High-pass, a little presence, gentle 2:1 levelling."""
    vo = sosfilt(butter(2, 80 / (SR / 2), "high", output="sos"), vo)
    vo = peaking(vo, 3000, 1.5, 0.9)
    env = envelope(vo, 0.005, 0.15)
    thresh = 0.12
    vo = vo * np.where(env > thresh, (thresh / np.maximum(env, 1e-9)) ** 0.5, 1.0)
    return vo / (np.max(np.abs(vo)) + 1e-9) * 0.89


def main(project):
    audio = os.path.join(project, "assets/audio")
    # The film is as long as its music (30 s for the Cutsway reels).
    n = sf.info(os.path.join(audio, "music.wav")).frames
    vo = np.zeros(n)
    custom = os.path.join(audio, "vo-lines", "lines.json")
    lines = json.load(open(custom)) if os.path.exists(custom) else LINES
    for name, start in lines:
        clip, sr = sf.read(os.path.join(audio, "vo-lines", name + ".wav"))
        assert sr == SR, (name, sr)
        if clip.ndim > 1:
            clip = clip.mean(axis=1)
        i = int(start * SR)
        j = min(n, i + len(clip))
        vo[i:j] += clip[: j - i]
        print(f"{name}  {start:6.2f} -> {start + len(clip) / SR:6.2f} s")
    vo = polish(vo)

    music, msr = sf.read(os.path.join(audio, "music.wav"), always_2d=True)
    assert msr == SR
    music = music[:n]
    # Duck the music about 8 dB while the voice talks, released smoothly between lines.
    duck = 1 - 0.6 * np.clip(envelope(vo, 0.02, 0.4) / 0.1, 0, 1)
    bed = music * duck[: len(music), None]

    sf.write(os.path.join(audio, "vo.wav"), np.stack([vo, vo], axis=1), SR, subtype="PCM_16")
    sf.write(os.path.join(audio, "music-bed.wav"), bed, SR, subtype="PCM_16")
    print("wrote vo.wav and music-bed.wav in", audio)


if __name__ == "__main__":
    main(sys.argv[1])
