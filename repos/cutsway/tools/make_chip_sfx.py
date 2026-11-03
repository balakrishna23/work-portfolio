"""Chiptune sound effects for the Cutsway arcade reel, synthesised from square waves (no samples, no API).

    python tools/make_chip_sfx.py videos/reel-quest/assets/sfx

Writes blip, select, coin, powerup, levelup, hit, start and tick as 48 kHz WAV files.
"""
import os
import sys
import wave

import numpy as np

SR = 48000


def square(freqs, dur, duty=0.5, vol=0.35, decay=None):
    """A square wave sweeping through `freqs` (one per equal step), with an optional exponential decay."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    steps = np.minimum((t / dur * len(freqs)).astype(int), len(freqs) - 1)
    f = np.asarray(freqs, dtype=float)[steps]
    phase = np.cumsum(f) / SR % 1
    x = np.where(phase < duty, 1.0, -1.0) * vol
    env = np.ones(n) if decay is None else np.exp(-t / decay)
    env[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    env[-int(0.004 * SR) :] *= np.linspace(1, 0, int(0.004 * SR))
    return x * env


def noise(dur, vol=0.3, decay=0.05, step=8):
    n = int(dur * SR)
    rng = np.random.default_rng(7)
    x = np.repeat(rng.choice([-1.0, 1.0], n // step + 1), step)[:n]
    return x * vol * np.exp(-np.arange(n) / SR / decay)


def note(m):
    return 440.0 * 2 ** ((m - 69) / 12)


SOUNDS = {
    "blip": lambda: square([note(84)], 0.06, 0.25, 0.3),
    "select": lambda: np.concatenate([square([note(79)], 0.05, 0.25), square([note(91)], 0.09, 0.25, decay=0.05)]),
    "coin": lambda: np.concatenate([square([note(83)], 0.07, 0.5), square([note(88)], 0.28, 0.5, decay=0.09)]),
    "powerup": lambda: square([note(m) for m in range(60, 96, 3)], 0.5, 0.5, 0.3),
    "levelup": lambda: np.concatenate(
        [square([note(m)], 0.09, 0.5, 0.3) for m in (72, 76, 79, 84, 79, 84)] + [square([note(88)], 0.45, 0.5, 0.3, decay=0.2)]
    ),
    "hit": lambda: noise(0.25, 0.4, 0.06, 6) + square([note(48), note(40)], 0.25, 0.5, 0.25, decay=0.08),
    "start": lambda: np.concatenate([square([note(m)], 0.08, 0.5, 0.3) for m in (67, 72, 76)] + [square([note(84)], 0.3, 0.5, 0.3, decay=0.12)]),
    "tick": lambda: square([note(96)], 0.03, 0.5, 0.2),
}


def write(path, x):
    data = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


if __name__ == "__main__":
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for name, make in SOUNDS.items():
        x = make()
        write(os.path.join(out, name + ".wav"), x)
        print(f"{name}: {len(x) / SR:.2f} s")
