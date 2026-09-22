# Near-shore forest detail

Generated with the built-in image-generation tool. Original 2172 × 724 RGBA PNG copied unchanged into `public/assets/shore-forest-detail.png`. Existing mountain panoramas are preserved.

## Final prompt

Use case: photorealistic-natural. Asset type: a high-detail transparent near-shore forest cutout texture for a real-time alpine lake environment, not a complete landscape scene. Create one panoramic 3:1 image, as high resolution as possible (3072x1024 or greater if available). Eye-level telephoto landscape photograph of a continuous irregular stand of mature alpine trees on a low rocky lakeside bank: Scots pine and Norway spruce, a few slender birches, dense natural undergrowth, weathered granite and moss at the very bottom. Individual branches, needles, leaves and bark should remain finely resolved; believable irregular spacing, different heights, restrained deep greens, soft neutral overcast daylight, no baked fog. Trees fill 75–90% of image height with a ragged varying silhouette. Several uneven clusters along the width rather than a repetitive hedge; ground is continuous along the entire bottom. Camera looks horizontally towards the trees from across water, NOT downwards. Preserve small natural transparent gaps between outer branches. Genuinely transparent alpha background everywhere behind and above the trees; clean antialiased edges with no colored fringe. Absolutely NO sky, mountains, distant hills, clouds, water, reflections, people, objects, text, logos, checkerboard pattern or solid background. The tree silhouette must occupy most of the canvas, not a small strip along the bottom. Real botanical detail, not painterly or smooth AI foliage.

## Implementation

- The texture is used on curved, irregularly spaced stands on the nearest banks, not enlarged over an entire mountain panorama.
- All stands share one texture and a single merged mesh, with stable per-visit variation.
- The original mountains now use shallow relief, while their waterline remains unchanged.
- Night tint, atmospheric haze and the existing planar water reflection apply to the new forest too.
