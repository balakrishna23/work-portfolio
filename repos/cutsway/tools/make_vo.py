"""Cutsway reel voiceover: one line per scene, fitted to its window, then mixed over a ducked music bed.

    python tools/make_vo.py rawpile    videos/reel
    python tools/make_vo.py nightshift videos/reel-nightshift

Writes <project>/assets/audio/vo.wav and <project>/assets/audio/music-bed.wav (music ducked under the voice).
Voices come from local Kokoro (`npx hyperframes tts`). To swap in another voice engine,
replace synth() and keep the rest.
"""
import os
import subprocess
import sys
import tempfile

import numpy as np
import soundfile as sf
from scipy.signal import butter, resample_poly, sosfilt

SR = 48000
LENGTH = 30.0

# (start s, window end s, text). Each line starts just after its scene's downbeat.
SCRIPTS = {
    "rawpile": {
        "voice": "af_heart",
        "lines": [
            (0.05, 3.70, "Four hours of gameplay. A folder of clips. And zero time to edit?"),
            (3.80, 7.40, "We cut it. Right down to the part people actually finish."),
            (7.55, 11.20, "Gaming videos. Story and retention edits, back in thirty-six hours."),
            (11.30, 14.95, "Shorts and reels. One VOD, a week of verticals, in twelve hours."),
            (15.05, 18.70, "Podcasts. Multi-cam, levelled and clipped, in forty-eight."),
            (18.80, 22.45, "Thumbnails. Three concepts in three hours. Final art in eight."),
            (22.55, 26.15, "Two rounds of notes. Then we post it. Everywhere."),
            (26.30, 29.70, "So send us the pile. Cutsway dot com."),
        ],
    },
    "nightshift": {
        "voice": "af_bella",
        "lines": [
            (0.05, 3.70, "Send it tonight. Your VODs, streams, podcasts. All of it."),
            (3.80, 6.95, "While you sleep, we're cutting. Thumbnails, done in eight."),
            (7.10, 10.25, "Shorts and reels? Back in twelve hours."),
            (10.38, 13.50, "Gaming videos. First cut by morning."),
            (13.66, 16.80, "Podcasts. Multi-cam, levelled, in forty-eight."),
            (16.95, 19.00, "Nine A.M. First cut's waiting."),
            (19.05, 20.60, "Plus two rounds of notes."),
            (20.70, 24.30, "And we post it for you. Every platform."),
            (24.45, 29.70, "Send it tonight. Cutsway dot com."),
        ],
    },
}


def synth(text, voice, speed, path):
    subprocess.run(
        ["npx", "--yes", "hyperframes@0.8.214", "tts", text, "--voice", voice, "--speed", f"{speed:.2f}", "--output", path],
        check=True,
        shell=(os.name == "nt"),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    data, sr = sf.read(path, always_2d=True)
    mono = data.mean(axis=1)
    if sr != SR:
        mono = resample_poly(mono, SR, sr)
    # Trim leading and trailing silence so lines land on their beat.
    env = np.abs(mono) > 0.01
    idx = np.flatnonzero(env)
    if len(idx):
        mono = mono[max(0, idx[0] - int(0.01 * SR)) : idx[-1] + int(0.06 * SR)]
    return mono


def fit_line(text, voice, window, tmp):
    """Synthesize at a lively pace; speed up only as much as the window needs."""
    speed = 1.08
    for _ in range(4):
        audio = synth(text, voice, speed, os.path.join(tmp, "line.wav"))
        dur = len(audio) / SR
        if dur <= window or speed >= 1.32:
            return audio, speed, dur
        speed = min(1.32, speed * dur / window * 1.02)
    return audio, speed, dur


def peaking(x, f0, gain_db, q=1.0):
    a = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * f0 / SR
    alpha = np.sin(w0) / (2 * q)
    b = np.array([1 + alpha * a, -2 * np.cos(w0), 1 - alpha * a])
    den = np.array([1 + alpha / a, -2 * np.cos(w0), 1 - alpha / a])
    from scipy.signal import lfilter

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


def produce(vo):
    """Broadcast-style chain: high-pass, warmth and presence, compression, light saturation."""
    vo = sosfilt(butter(2, 90 / (SR / 2), "high", output="sos"), vo)
    vo = peaking(vo, 220, 1.5, 0.8)
    vo = peaking(vo, 3200, 3.0, 0.9)
    vo = peaking(vo, 7500, -2.0, 1.2)
    env = envelope(vo, 0.003, 0.12)
    thresh = 0.08
    gain = np.where(env > thresh, (thresh / np.maximum(env, 1e-9)) ** (1 - 1 / 3.5), 1.0)
    vo = vo * gain
    vo = np.tanh(2.2 * vo / (np.max(np.abs(vo)) + 1e-9)) / np.tanh(2.2)
    return vo


def main(style, project):
    cfg = SCRIPTS[style]
    n = int(LENGTH * SR)
    vo = np.zeros(n)
    with tempfile.TemporaryDirectory() as tmp:
        for start, end, text in cfg["lines"]:
            audio, speed, dur = fit_line(text, cfg["voice"], end - start, tmp)
            i = int(start * SR)
            j = min(n, i + len(audio))
            vo[i:j] += audio[: j - i]
            flag = "" if dur <= end - start else "  (over by %.2fs)" % (dur - (end - start))
            print(f"{start:6.2f}s  {dur:4.2f}s / {end - start:4.2f}s  x{speed:.2f}  {text}{flag}")
    vo = produce(vo)

    music, msr = sf.read(os.path.join(project, "assets/audio/music.wav"), always_2d=True)
    assert msr == SR
    music = music[:n]
    # Duck the music about 7 dB while the voice talks, with a smooth release.
    voice_env = envelope(vo, 0.02, 0.35)
    duck = 1 - 0.55 * np.clip(voice_env / 0.12, 0, 1)
    bed = music * duck[: len(music), None]

    out = os.path.join(project, "assets/audio")
    sf.write(os.path.join(out, "vo.wav"), np.stack([vo, vo], axis=1) * 0.9, SR, subtype="PCM_16")
    sf.write(os.path.join(out, "music-bed.wav"), bed, SR, subtype="PCM_16")
    print("wrote", os.path.join(out, "vo.wav"), "and music-bed.wav")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
