# Hamster pixel artwork

Created with the built-in image-generation tool. The selected PNG is copied at its original resolution, with its generated alpha channel preserved.

Final design prompt: A single plump golden hamster in a low horizontal running pose, facing right, in chunky low-resolution pixel art. Large square pixel clusters, a stepped dark-brown outline, cream cheek and belly, tiny round pink ears and paws, short muzzle, glossy black eye, no tail. No realism, fur hairs, scenery, text, or sprite sheet. Transparent padding.

Final extraction prompt: Keep this exact pixel hamster unchanged. Remove the baked-in white/gray checkerboard entirely and output actual RGBA PNG transparency around the hamster. Do not draw a checkerboard. Do not change character colors, pixel shapes, proportions, pose, outline, size, or details. Character only on transparent alpha, no shadow, no glow.

The website preserves the sprite body and masks the original static paws. Connected SVG limbs are anchored underneath the body and follow the wheel's running surface; paws are not translated image cutouts. The source PNG is not cropped, compressed, or resampled on disk.
