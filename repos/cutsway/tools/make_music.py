"""Cutsway reel music: an original, beat-locked house track synthesised from scratch.

    python tools/make_music.py rawpile    videos/reel/assets/audio/music.wav
    python tools/make_music.py nightshift videos/reel-nightshift/assets/audio/music.wav
    python tools/make_music.py saas       videos/reel-saas/assets/audio/music.wav

128 BPM, 16 bars = 30 s exactly, so every scene cut lands on a beat:
beat = 0.46875 s, bar = 1.875 s. Each style sets its key, chords and arrangement.
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
BPM = 128
BEAT = 60 / BPM
BAR = BEAT * 4
BARS = 16
LENGTH = BAR * BARS
N = int(round(LENGTH * SR))

rng = np.random.default_rng(228341325)


def filt(x, fc, kind="low", order=2):
    if isinstance(fc, (list, tuple)):
        wn = [f / (SR / 2) for f in fc]
    else:
        wn = min(fc / (SR / 2), 0.99)
    return sosfilt(butter(order, wn, kind, output="sos"), x)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def t_of(n):
    return np.arange(n) / SR


def saw(f, n):
    return 2 * ((f * t_of(n) + rng.random()) % 1) - 1


def supersaw(f, n, spread=(-0.11, -0.04, 0.0, 0.04, 0.11)):
    return sum(saw(f * 2 ** (d / 12), n) for d in spread) / len(spread)


def kick(n=int(0.45 * SR)):
    t = t_of(n)
    f = 46 + 90 * np.exp(-t / 0.035)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.26)
    click = filt(rng.standard_normal(n), 3000, "high") * np.exp(-t / 0.004) * 0.25
    return np.tanh(1.6 * (body + click))


def clap(n=int(0.35 * SR)):
    t = t_of(n)
    noise = filt(rng.standard_normal(n), (900, 3200), "band")
    env = np.zeros(n)
    for off in (0.0, 0.011, 0.022):
        i = int(off * SR)
        env[i:] += np.exp(-(t[: n - i]) / 0.007)
    env += 0.6 * np.exp(-t / 0.11) * (t > 0.022)
    return noise * env * 0.7


def hat(tau=0.022, n=int(0.2 * SR)):
    t = t_of(n)
    return filt(rng.standard_normal(n), 7500, "high") * np.exp(-t / tau) * 0.35


def riser(dur):
    n = int(dur * SR)
    t = t_of(n)
    ramp = (t / dur) ** 2
    noise = filt(rng.standard_normal(n), 1800, "high") * ramp * 0.35
    f = 220 + 1400 * (t / dur) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * ramp * 0.12
    return noise + tone


def impact(n=int(1.6 * SR)):
    t = t_of(n)
    sub = np.sin(2 * np.pi * np.cumsum(38 + 40 * np.exp(-t / 0.08)) / SR) * np.exp(-t / 0.55)
    crash = filt(rng.standard_normal(n), 900, "low") * np.exp(-t / 0.3) * 0.5
    air = filt(rng.standard_normal(n), 5000, "high") * np.exp(-t / 0.7) * 0.18
    return np.tanh(1.2 * (sub + crash)) * 0.9 + air


def pluck(f, dur, bright=3200, tone="saw"):
    n = int(dur * SR)
    t = t_of(n)
    if tone == "chip":
        x = np.sign(np.sin(2 * np.pi * f * t)) * 0.45 + np.sign(np.sin(2 * np.pi * f * 2 * t)) * 0.12
        return filt(x, bright) * np.exp(-t / (dur * 0.5))
    if tone == "keys":
        x = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.4 for k in (1, 2, 3, 4))
        return x * np.exp(-t / (dur * 0.45)) * 0.5
    return filt(supersaw(f, n), bright) * np.exp(-t / (dur * 0.35))


def place(buf, clip, at, gain=1.0):
    i = int(round(at * SR))
    if i >= len(buf):
        return
    j = min(len(buf), i + len(clip))
    buf[i:j] += clip[: j - i] * gain


STYLES = {
    # A minor, bright supersaw stabs: the razor and the burn.
    "rawpile": {
        "chords": [(45, (57, 60, 64)), (41, (57, 60, 65)), (48, (55, 60, 64)), (43, (55, 59, 62))],
        "stab_tone": "saw",
        "stab_bright": 3400,
        # bar index -> layers present
        "full": set(range(2, 14)),
        "intro": {0, 1},
        "lead": set(range(8, 14)),
        "risers": [(1, 1.0), (13, 1.0)],
        "impacts": [2, 14],
        "fills": [11],
        "outro": {14, 15},
    },
    # D minor, warm keys and pads: one night in the studio.
    "nightshift": {
        "chords": [(38, (57, 62, 65)), (46, (58, 62, 65)), (41, (57, 60, 65)), (48, (55, 60, 64))],
        "stab_tone": "keys",
        "stab_bright": 2400,
        "full": set(range(2, 13)),
        "intro": {0, 1},
        "lead": set(range(5, 9)) | {11, 12},
        "risers": [(1, 1.0), (8, 0.9), (12, 1.0)],
        "impacts": [2, 9, 13],
        "fills": [10],
        "outro": {13, 14, 15},
    },
    # A minor like rawpile, but a longer build: the drop lands when the folder hits the timeline (bar 3),
    # the lead runs under the plan cards and the last hit lands on the logo (bar 14).
    "saas": {
        "chords": [(45, (57, 60, 64)), (41, (57, 60, 65)), (48, (55, 60, 64)), (43, (55, 59, 62))],
        "stab_tone": "saw",
        "stab_bright": 3600,
        "full": set(range(3, 14)),
        "intro": {0, 1, 2},
        "lead": set(range(7, 10)) | {12, 13},
        "risers": [(2, 1.0), (13, 1.0)],
        "impacts": [3, 14],
        "fills": [6, 9],
        "outro": {14, 15},
    },
    # F major, bright keys: the cartoon. Light groove under the monster, the drop when the editors burst in (bar 6),
    # the lead under the snips and the race, the last hit on the end card (bar 13).
    "cartoon": {
        "chords": [(41, (57, 60, 65)), (48, (55, 60, 64)), (38, (57, 62, 65)), (46, (58, 62, 65))],
        "stab_tone": "keys",
        "stab_bright": 2800,
        "full": set(range(2, 13)),
        "intro": {0, 1},
        "lead": set(range(6, 11)),
        "risers": [(5, 1.0), (12, 0.8)],
        "impacts": [6, 13],
        "fills": [5, 10],
        "outro": {13, 14, 15},
    },
    # A minor chiptune: square-wave stabs and lead, the arcade quest. Drop on "summon your party" (bar 5).
    "quest": {
        "chords": [(45, (57, 60, 64)), (41, (57, 60, 65)), (43, (55, 59, 62)), (40, (56, 59, 64))],
        "stab_tone": "chip",
        "stab_bright": 6000,
        "full": set(range(5, 14)),
        "intro": {0, 1, 2, 3, 4},
        "lead": set(range(5, 13)),
        "risers": [(4, 1.0), (12, 0.8)],
        "impacts": [5, 14],
        "fills": [8, 12],
        "outro": {14, 15},
    },
    # D minor, dry and punchy: Swiss type that cuts on every beat. 12 bars = 22.5 s.
    "type": {
        "bars": 12,
        "chords": [(38, (57, 62, 65)), (38, (57, 62, 65)), (46, (58, 62, 65)), (45, (57, 61, 64))],
        "stab_tone": "saw",
        "stab_bright": 2600,
        "full": set(range(2, 10)),
        "intro": {0, 1},
        "lead": {6, 7, 8},
        "risers": [(1, 1.0), (8, 0.8)],
        "impacts": [2, 9],
        "fills": [5],
        "outro": {10, 11},
    },
    # Eb major, half-time and warm: a late-night chat. Kick on 1 and 3, clap on 3.
    "chat": {
        "chords": [(39, (55, 58, 63)), (43, (55, 58, 62)), (36, (55, 60, 63)), (44, (56, 60, 63))],
        "stab_tone": "keys",
        "stab_bright": 2000,
        "kicks": (0, 2),
        "claps": (2,),
        "full": set(range(2, 14)),
        "intro": {0, 1},
        "lead": set(range(8, 12)),
        "risers": [(5, 0.6), (13, 0.8)],
        "impacts": [6, 14],
        "fills": [],
        "outro": {14, 15},
    },
    # D major, warm keys: Illoura's "a pleasant place". 23 bars = 43.1 s. A soft pad-and-bass bed under the
    # story (no kick for the first two bars), the drop on the logo (bar 11), the lead under the industries.
    "illoura": {
        "bars": 23,
        "chords": [(38, (57, 62, 66)), (45, (57, 61, 64)), (47, (59, 62, 66)), (43, (55, 59, 62))],
        "stab_tone": "keys",
        "stab_bright": 2200,
        "nokick": {0, 1},
        "pads": set(range(2, 11)),
        "full": set(range(11, 20)),
        "intro": set(range(0, 11)),
        "lead": {14, 15, 16},
        "risers": [(10, 1.0), (19, 0.8)],
        "impacts": [11, 20],
        "fills": [13],
        "outro": {20, 21, 22},
    },
}


def build(style):
    s = STYLES[style]
    bars = s.get("bars", BARS)
    N = int(round(BAR * bars * SR))
    kicks = s.get("kicks", (0, 1, 2, 3))
    claps = s.get("claps", (1, 3))
    drums = np.zeros(N)
    music = np.zeros(N)
    fx = np.zeros(N)
    kick_times = []
    K, C, H, OH = kick(), clap(), hat(), hat(0.11)

    for bar in range(bars):
        b0 = bar * BAR
        root, triad = s["chords"][bar % 4]
        outro = bar in s["outro"]
        full = bar in s["full"]
        intro = bar in s["intro"]
        last = bar == bars - 1

        # Drums: four on the floor, claps on 2 and 4, hats on every off-beat.
        if not last:
            for beat in range(4):
                at = b0 + beat * BEAT
                if beat in kicks and bar not in s.get("nokick", ()) and not (outro and bar > min(s["outro"])):
                    place(drums, K, at, 0.8)
                    kick_times.append(at)
                if beat in claps and (full or outro):
                    place(drums, C, at, 0.7)
                place(drums, H if intro else OH, at + BEAT / 2, 0.3 if intro else 0.2)
                if full:
                    for q in (0.25, 0.75):
                        place(drums, H, at + BEAT * q, 0.12)
            if bar in s["fills"]:
                for k in range(8):
                    place(drums, C, b0 + 2 * BEAT + k * BEAT / 4, 0.35 + 0.06 * k)

        # Bass: off-beat house bass on the chord root.
        if not last:
            for beat in range(4):
                n = int(BEAT * 0.45 * SR)
                note = filt(saw(hz(root), n) * 0.6 + np.sin(2 * np.pi * hz(root) * t_of(n)) * 0.6, 900)
                note *= np.minimum(1, t_of(n) / 0.005) * np.exp(-t_of(n) / 0.16)
                place(music, note, b0 + beat * BEAT + BEAT / 2, 0.85 if (full or outro) else 0.7)

        # Pad under everything once the track opens up, ringing on in the outro.
        if full or outro or bar in s.get("pads", ()):
            n = int(BAR * SR * (2.2 if last else 1.0))
            pad = sum(filt(supersaw(hz(m), n), 1300) for m in triad) / 3
            pad *= np.minimum(1, t_of(n) / 0.08) * (np.exp(-t_of(n) / 1.4) if last else 1)
            place(music, pad, b0, 0.26)

        # Stabs: a syncopated chord hit pattern (16ths).
        if full or (outro and not last):
            for step in (0, 3, 6, 10, 12, 14):
                for m in triad:
                    place(music, pluck(hz(m + 12), 0.22, s["stab_bright"], s["stab_tone"]), b0 + step * BEAT / 4, 0.24)
        if last:
            for m in triad:
                place(music, pluck(hz(m + 12), 1.8, s["stab_bright"], s["stab_tone"]), b0, 0.4)

        # Lead: a 16th-note arpeggio of the chord, two octaves up.
        if bar in s["lead"]:
            seq = [triad[0], triad[1], triad[2], triad[1] + 12, triad[2], triad[0] + 12, triad[1], triad[2] + 12]
            for step in range(16):
                m = seq[step % len(seq)] + 12
                place(music, pluck(hz(m), 0.14, 5000, "saw"), b0 + step * BEAT / 4, 0.15)

    for bar, dur in s["risers"]:
        r = riser(dur * BAR)
        place(fx, r, (bar + 1) * BAR - len(r) / SR, 0.9)
    for bar in s["impacts"]:
        place(fx, impact(), bar * BAR, 0.75)

    # Sidechain: duck the music under each kick.
    duck = np.ones(N)
    for at in kick_times:
        i = int(at * SR)
        n = min(int(0.25 * SR), N - i)
        duck[i : i + n] = np.minimum(duck[i : i + n], 1 - 0.65 * np.exp(-t_of(n) / 0.07))
    music *= duck

    mix = drums * 0.9 + music + fx * 0.8
    left = mix + filt(music, 400, "high") * 0.08 * np.sin(2 * np.pi * 0.25 * t_of(N))
    right = mix - filt(music, 400, "high") * 0.08 * np.sin(2 * np.pi * 0.25 * t_of(N))
    stereo = np.stack([left, right], axis=1)
    stereo = np.tanh(1.3 * stereo / np.max(np.abs(stereo)))
    fade = np.ones(N)
    fade[-int(0.4 * SR) :] = np.linspace(1, 0, int(0.4 * SR))
    stereo *= fade[:, None] * 0.95
    return stereo


def write(path, stereo):
    data = (np.clip(stereo, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


if __name__ == "__main__":
    style, out = sys.argv[1], sys.argv[2]
    write(out, build(style))
    print(f"{style}: {BAR * STYLES[style].get('bars', BARS):.3f} s, {BPM} BPM -> {out}")
