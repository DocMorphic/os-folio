# Chromium offline T-Rex runner

Original Chromium source and sprites, pinned to Chromium **90.0.4430.212**.

Source: https://github.com/chromium/chromium/tree/90.0.4430.212/components/neterror/resources

- `offline.js`: upstream `offline.js`, byte-for-byte unchanged.
- `100-offline-sprite.png`: upstream `images/default_100_percent/offline/100-offline-sprite.png`, unchanged.
- `200-offline-sprite.png`: upstream `images/default_200_percent/offline/200-offline-sprite.png`, unchanged.
- `LICENSE`: original Chromium BSD license, included with this distribution.
- `index.html` and `adapter.js`: local embedding shell. Supplies the Chromium resource lookup stub, starts the game during loading, forwards keyboard/touch input, and disables the separate game audio context to respect the site's master mute. Gameplay, animation, collision, scoring, and artwork come from Chromium, not a recreation.

The runner lives in a scripts-only sandboxed iframe so removing it on route readiness also tears down its animation loop, listeners and singleton. Nothing loads from an external game host. Chromium and Google do not endorse this portfolio.
