# World audio

The Kenney and rubberduck samples below are **CC0 1.0** and may be redistributed commercially. The separately credited Nintendo clips are NOT CC0.
License: https://creativecommons.org/publicdomain/zero/1.0/

- Kenney — [Impact Sounds](https://kenney.nl/assets/impact-sounds): wood, bell.
- Kenney — [RPG Audio](https://kenney.nl/assets/rpg-audio): page turns, window mechanism, metal latch, coins.
- Kenney — [Interface Sounds](https://kenney.nl/assets/interface-sounds): key clicks, switch, arcade confirmation.
- Kenney — [Digital Audio](https://kenney.nl/assets/digital-audio), CC0: `threeTone1.ogg` and `twoTone2.ogg` become `arcade-change-1.mp3` and `arcade-change-2.mp3`. Retained but no longer played; replaced with an original cabinet-relay cue.
- rubberduck — [40 CC0 water / splash / slime SFX](https://opengameart.org/content/40-cc0-water-splash-slime-sfx): splash_03, splash_05, splash_07, loop_water_02.

Converted to mono 32 kHz MP3, gently band-limited and peak-limited. The exact original filenames and conversion command are in `scripts/prepare-world-audio.mjs`.
The original hologram synthesis remains in `lib/sound-palette.ts` as an unused fallback. Active hologram and arcade effects now use the recordings from Jesse Zhou's portfolio, as credited below.

## Hologram and arcade screen switch — active

Recordings used by **Jesse Zhou's Ramen-Shop portfolio**, with Dharmay Dave's explicit confirmation of permission on 2026-09-21. These files are not asserted to be CC0 or generally licensed for reuse by others.

- Hologram source: https://github.com/enderh3art/Ramen-Shop/blob/main/static/sounds/hologram.mp3
- `jesse-hologram-original.mp3` is the byte-for-byte original. Active `jesse-hologram.mp3` preserves its pitch and first 2.8 seconds, normalizes to -25 LUFS, and fades the quiet ending to match the reconstruction. Reproduce with `scripts/prepare-jesse-hologram.mjs`. No extra synthesized particle impacts are mixed in.
- Arcade source: https://github.com/enderh3art/Ramen-Shop/blob/main/static/sounds/arcade.mp3
- `jesse-arcade-original.mp3` is the unmodified recording, used at original speed for Mario/credits screen switching. Runtime gain and HRTF positioning apply.

### Previous arcade game-start effect (retained, no longer played)

Plasterbrain — [Game Start](https://freesound.org/people/plasterbrain/sounds/243020/), **CC0**. A layered, synthesized arcade game-start cue. Source: https://cdn.freesound.org/previews/243/243020_4284968-hq.mp3

`arcade-start.mp3`: first 1.05 seconds at original speed/pitch, retaining the attack and audible decay; the original's near-silent 1.8-second reverb tail is omitted. Mono 44.1 kHz / 128 kbps, gently band-limited, gain adjusted and faded at the endpoint. Reproduce with `scripts/prepare-arcade-start.mjs`. No speech, no ambient arcade crowd. Used spatially at the cabinet for Mario/credits changes.

### Previous menu-select clip (retained, no longer played)

TheDweebMan — [8-Bit Select Menu - Select](https://freesound.org/people/TheDweebMan/sounds/277216/), **CC0**. Original 0.115-second 8-bit menu-select effect, used at its natural speed for Mario/credits switching. Source: https://cdn.freesound.org/previews/277/277216_5324223-hq.mp3

`arcade-select.mp3`: mono 32 kHz / 96 kbps, softly band-limited with 3 ms attack / 15 ms release and reduced gain. Reproduce with `scripts/prepare-arcade-select.mjs`. Replaces the previous synthesized cabinet click and unused two-/three-tone samples.

## Griddle ambience

BenjaminNelan — [Frying Pan Sizzle](https://freesound.org/people/BenjaminNelan/sounds/353124/), CC0. Actual food frying in a pan; source preview: https://cdn.freesound.org/previews/353/353124_1196020-hq.mp3

`grill-sizzle.mp3`: an 11-second mono loop, filtered to remove low rumble and harsh high frequencies, with restrained compression and a crossfaded loop seam. Converted using `scripts/prepare-grill-audio.mjs`. A single HRTF emitter sits at the griddle, fades with distance, ducks during screen inspection, and stops on mute, hidden tabs, route exit, or loader hold. It is not part of the camera sound.

## Music

Active day/night soundtrack, supplied by the site owner from Downloads:

- Day: “Minecraft” by C418 — `minecraft.mp3` (original file copied unchanged).
- Night: “Haggstrom” by C418 — `haggstrom.mp3` (original `haggstrome.mp3` copied unchanged).

Both are streamed locally, looped, and crossfaded when the world changes between day and night. These recordings are not CC0 or CC BY; attribution alone does not grant redistribution rights. Confirm website-use permissions before publishing.

### Previous soundtrack (retained, no longer played)

“Reverie” by Scott Buckley — released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). www.scottbuckley.com.au

- Source and license: https://www.scottbuckley.com.au/library/reverie/
- Original: https://www.scottbuckley.com.au/library/wp-content/uploads/2020/03/sb_reverie.mp3
- Local file: `reverie.mp3`. Full recording, stereo 44.1 kHz / 112 kbps MP3, loudness adjusted to -20 LUFS, 2-second opening and 4-second closing fades. Original composition unchanged; retained but unused.

## Spatial camera swoosh

Active sound: the wind recording used in **Jesse Zhou's Ramen-Shop portfolio**, `static/sounds/whoosh.mp3`. Used on the basis of Dharmay Dave's explicit confirmation of permission on 2026-09-21. This is not asserted to be CC0 or generally licensed for reuse by others.

- Source: https://github.com/enderh3art/Ramen-Shop/blob/main/static/sounds/whoosh.mp3
- Byte-for-byte original: `jesse-whoosh-original.mp3`.
- Active playback uses the byte-for-byte original at **1x speed**, starting at 0.18 seconds and ending by 1.55 seconds. Camera trips share this 1.37-second duration: longer paths move faster instead of stretching the audio. A wall-clock camera timeline prevents low frame rates from delaying the visual finish. Only short 80 ms / 220 ms edge fades and restrained runtime gain are applied. No stretching, granular processing, looping, or extra wind layer.
- Runtime playback retains HRTF spatial movement, distance-based gain, mute/volume controls and preload before the entrance. Day/night music is unchanged.
- The old `jesse-wind-short.mp3`, `jesse-wind-medium.mp3`, `jesse-wind-long.mp3` and `scripts/prepare-jesse-wind.mjs` are retained as unused history. They are no longer fetched or decoded: their time stretch introduced flutter.

### Previous outdoor breeze (retained, no longer played)

rubindaniel — [Soft breeze at Budaorsi koparok - No1](https://freesound.org/people/rubindaniel/sounds/844817/), CC0. A stereo outdoor breeze recording in Buda hills, Hungary. Source: https://cdn.freesound.org/previews/844/844817_15082088-hq.mp3

`camera-breeze-short.mp3`, `camera-breeze-medium.mp3`, `camera-breeze-long.mp3`: natural-speed excerpts starting at 00:12, lasting 0.8 / 1.75 / 3.2 seconds. Band-limited to 65–900 Hz for rounded low air without bright hiss, normalized to -30 LUFS before gentle half-sine fades. Conversion: `scripts/prepare-camera-air.mjs`. Asset trips use the long excerpt at natural speed, trimmed to the trip, with a gain envelope following quintic camera velocity and a gentler HRTF traversal. The entrance retains its duration-fitted variant; decoding is awaited before its camera is released.

### Previous object-pass effect (retained, no longer played)

artisticdude — [Swishes Sound Pack](https://opengameart.org/content/swishes-sound-pack), CC0. Source archive: https://opengameart.org/sites/default/files/swishes.zip (`swish-7.wav`, `swish-9.wav`). `camera-pass-short.mp3`, `camera-pass-medium.mp3`, `camera-pass-long.mp3` are the previous processed wood/hanger swishes. Retained but unused.

### Previous air movement effect (retained, no longer played)

Almitory — [Air Woosh Move](https://opengameart.org/content/air-woosh-move), CC0 1.0. Source: https://opengameart.org/sites/default/files/air_move.wav

`camera-air-short.mp3`, `camera-air-medium.mp3`, `camera-air-long.mp3`: previous isolated movement effect, trailing silence removed, pitch-preserving time-stretch to 0.8 / 1.6 / 3.2 seconds, gently band-limited and loudness-adjusted. Retained but unused.

### Previous spatial air (retained, no longer played)

Thimras — [Park ambiences](https://opengameart.org/content/park-ambiences), CC0 1.0. Outdoor field recording in Adelaide, South Australia. Source: `park_ambience_wind.wav`.

`field-air.mp3` is a 12-second excerpt starting at 00:16, high-passed at 180 Hz and low-passed at 3500 Hz, normalized to -20 LUFS, mono 24 kHz / 64 kbps MP3. Playback uses varied offsets without pitch stretching, a flight-length envelope, and HRTF positioning. It is not an additional constant wind loop.

Jesse Zhou's portfolio informed the event-specific sound hierarchy (quiet bed, separate tactile objects, prominent entrance). His wind, hologram and arcade recordings are used with user-confirmed permission as documented above. The television remains the official YouTube embed, credited to SAD-ist.

## Mario arcade clips (not CC0)

`mario-jump.mp3` and `mario-coin.mp3`: short original Super Mario Bros. NES effects, Nintendo, obtained from [The Mushroom Kingdom sound archive](https://themushroomkingdom.net/media/smb/wav), submitted by Deezer. Sources: `smb_jump-small.wav`, `smb_coin.wav`. Converted to mono 32 kHz MP3; not music tracks. Nintendo retains the rights; attribution is not a redistribution license. Included for the requested local arcade prototype alongside its existing Nintendo artwork; review permissions before public distribution.
