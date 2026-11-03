# REVIEW: Cutsway "Quest" (pixel arcade, 30 s)
- Built on auto (user: "make some more but with diff styles and run on auto"). Story: PLAYER 1 -> quest card "EDIT A 4H VOD"
  -> energy critically low -> SUMMON PARTY? (do it alone / call Cutsway) -> CUTSWAY HAS JOINED (EDIT / ART / POST)
  -> side-scroller loot: SHORTS 12H, VIDEOS 36H, PODCASTS 48H, THUMBNAILS 8H -> 2 rounds of notes + language select
  -> QUEST COMPLETE / LEVEL UP -> CONTINUE? -> CUTSWAY wordmark, CUTSWAY.COM, WhatsApp.
- One canvas at 270x480 scaled 4x (crisp pixels), hand-made 5x7 pixel font, sprites in code. Real wordmark at the end (logo.html).
- Voice: ElevenLabs "Brian" (announcer), eleven_v3, 10 lines, every one transcribed back correctly. Music: make_music.py quest
  (square-wave chip). SFX: tools/make_chip_sfx.py (synthesised locally).
- check passes; kept warning dead_stretch (false positive: all motion is on the canvas). Upload: -14 LUFS.
- ElevenLabs is on the Free plan: re-record the 10 lines after upgrading before posting commercially.
