# Original Super Mario Bros. NES assets

Original game artwork © Nintendo. Files acquired from Super Mario Wiki's Super Mario Bros. NES sprite gallery, 14 September 2026. Wiki availability is not an open asset license.

Gallery: https://www.mariowiki.com/Gallery:Super_Mario_Bros.

| Local file | Native size | Original image URL |
|---|---|---|
| walk.gif | 16×16, 3 frames, 100 ms each | https://mario.wiki.gallery/images/4/48/Small_Mario_Walk_SMB.gif |
| jump.png | 16×16 | https://mario.wiki.gallery/images/1/12/SMB_Small_Mario_Jumping_Sprite.png |
| stand.png | 12×16 | https://mario.wiki.gallery/images/0/02/SMB_Smallmario.png |
| goomba.gif | 16×16, 2 frames | https://mario.wiki.gallery/images/4/4e/SMB_Goomba_Sprite.gif |
| ground.png | 16×16 | https://mario.wiki.gallery/images/6/6a/SMB_Ground.png |
| brick.png | 16×16 | https://mario.wiki.gallery/images/7/7e/SMB_Brick_Block_Sprite.png |
| question.png | 16×16 | https://mario.wiki.gallery/images/4/43/SMB_Qblock.png |
| question.gif | 16×16, 5 frames; 150,150,150,150,300 ms | https://mario.wiki.gallery/images/5/50/SMB_Question_Block.gif |
| pipe.png | 32×32 | https://mario.wiki.gallery/images/b/be/Warp_Pipe_SMB.png |
| coin.gif | 10×14 | https://mario.wiki.gallery/images/0/04/SMBCoin.gif |
| world-1-1.png | 3584×240 | https://mario.wiki.gallery/images/3/38/SMB_NES_World_1-1_Map.png |
| screenshot.png | 256×240 | https://mario.wiki.gallery/images/0/00/StompThatGoombaNES.png |

The PNG atlases mechanically decode the original GIFs with ffmpeg and concatenate horizontally, without redrawing or resizing:

- mario-walk-atlas.png: 48×16; frame rectangles (0,0,16,16), (16,0,16,16), (32,0,16,16).
- goomba-atlas.png: 32×16; frame rectangles (0,0,16,16), (16,0,16,16).
- question-atlas.png: 80×16; frame x=0,16,32,48,64, each 16×16.

The map includes enemies and annotations; it is not an empty background. These scenery assets were cropped mechanically from that map and the blue sky removed with ffmpeg colorkey=0x9290ff:0.1:0. No new sprite pixels were painted:

- cloud.png: 32×24, crop x136 y48.
- hill.png: 80×40, crop x0 y168; transparent padding above the hill.
- bush.png: 64×32, crop x184 y176; transparent padding above the bush.

Source map page: https://www.mariowiki.com/File:SMB_NES_World_1-1_Map.png

Files ending -inspect.png are enlarged QA previews and should not be integrated.
