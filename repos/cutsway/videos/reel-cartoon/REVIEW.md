# REVIEW: Cutsway cartoon reel, "The Backlog Monster" (30 s, 1080 x 1920)

## Creative calls
- Picked by the user from STORYLINES.md (A). B "3 A.M." and C "Two Streamers" are written there, unbuilt.
- Everything is drawn in compositions/story.html (canvas, boiling ink at 12 fps); captions, the calendar and the
  end card are DOM (words.html, end.html). No client work or real thumbnails (the user said not to use them).
- Voice: ElevenLabs Chris, eleven_v3, 8 lines (assets/audio/vo-lines, placed by lines.json). Music: make_music.py cartoon.
- Cartoon SFX (boing, chomp, snip, poof, burst, ring, hop, tick) generated with ElevenLabs sound effects.
- Upload file: renders/cutsway-cartoon-reel-30s-instagram.mp4 (also in ~/Downloads).

## Measured
- `hyperframes check`: passes, no errors (kept warning: story.html length, it holds the whole drawing).
- Upload: H.264 1080x1920 30 fps + AAC, -14.0 LUFS, peak -1.2 dBFS.
- Every voice line was transcribed back with ElevenLabs Scribe; words correct. Not heard: the mix and the generated SFX
  were checked by meters only.

## Before posting
- ElevenLabs is on the Free plan (no commercial licence). After upgrading to Starter, regenerate the 8 lines and the
  8 SFX, run `python ../../tools/make_saas_audio.py .`, and re-render.

## Weakest moments
- 24.4-25.3 s: the Night end card has only the pets for a second before "Feed us your backlog" lands.
- Race scene: the pets are small next to the phone.
