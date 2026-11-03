"""Synthesises the promo's sound effects (original, no third-party samples) into public/sfx/."""
import wave
from pathlib import Path
import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / 'public' / 'sfx'
rng = np.random.default_rng(7)


def t(seconds):
    return np.arange(int(seconds * SR)) / SR


def lowpass(x, cutoff):
    # one-pole low-pass; cutoff may be an array (time-varying)
    a = np.exp(-2 * np.pi * np.broadcast_to(cutoff, x.shape) / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a[i]) * v + a[i] * acc
        y[i] = acc
    return y


def reverb(x, seconds=1.2, mix=0.25):
    tail = rng.standard_normal(int(seconds * SR)) * np.exp(-t(seconds) * 5)
    wet = np.convolve(x, tail) / np.sqrt(len(tail))
    dry = np.concatenate([x, np.zeros(len(wet) - len(x))])
    return dry + mix * wet


def stereo_write(name, left, right=None, peak=0.89):
    right = left if right is None else right
    s = np.stack([left, right], 1)
    s = s / np.abs(s).max() * peak
    with wave.open(str(OUT / name), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((s * 32767).astype(np.int16).tobytes())
    print(name, f'{len(s) / SR:.2f}s')


# Riser: noise swept upward plus a rising tone, swelling into the drop
x = t(1.6)
env = (x / x[-1]) ** 2.2
sweep = lowpass(rng.standard_normal(len(x)), 300 + 9000 * (x / x[-1]) ** 2)
freq = 110 * 2 ** (3 * x / x[-1])
tone = np.sin(2 * np.pi * np.cumsum(freq) / SR) * 0.35
riser = (sweep * 1.4 + tone) * env
riser[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
stereo_write('riser.wav', riser, np.roll(riser, 240))

# Impact: sub drop with a noise crack and a long tail
x = t(2.4)
sub = np.sin(2 * np.pi * np.cumsum(58 * np.exp(-x * 2.2) + 30) / SR) * np.exp(-x * 2.1)
crack = lowpass(rng.standard_normal(len(x)), 2500) * np.exp(-x * 28) * 0.9
body = lowpass(rng.standard_normal(len(x)), 180) * np.exp(-x * 4) * 1.5
impact = reverb(np.tanh((sub * 1.3 + crack + body) * 1.6), 1.6, 0.18)
stereo_write('impact.wav', impact, np.roll(impact, 120))

# Hit: short punch for beat cuts
x = t(0.7)
hit = np.sin(2 * np.pi * np.cumsum(140 * np.exp(-x * 18) + 48) / SR) * np.exp(-x * 9)
hit += lowpass(rng.standard_normal(len(x)), 4000) * np.exp(-x * 60) * 0.6
stereo_write('hit.wav', reverb(np.tanh(hit * 1.4), 0.6, 0.15))

# Shimmer: soft metallic chime for the logo and the button sweep
x = t(1.8)
partials = [(1318.5, 1.0), (1975.5, 0.6), (2637.0, 0.45), (3951.1, 0.25), (5274.0, 0.15)]
chime = sum(a * np.sin(2 * np.pi * f * x + i) * np.exp(-x * (2.2 + i)) for i, (f, a) in enumerate(partials))
chime *= np.minimum(1, x / 0.012)
left = reverb(chime, 1.5, 0.35)
right = reverb(np.roll(chime, 360), 1.5, 0.35)
stereo_write('shimmer.wav', left, right, peak=0.7)
