# Uploaded effects integration

Files supplied by user: ボタン.mp3 -> tap; せいかい.mp3 -> correct; まちがい.mp3 -> wrong; ガチャ.mp3 -> capsule; なかま登場.mp3 -> arrival. Converted to mono 44.1kHz 80kbps MP3 for delivery (about 120KB total); original uploads unchanged.

Source duration / mean dBFS / peak dBFS: tap 1.52/-28.3/-8.2; correct 1.52/-26.1/-6.2; wrong .55/-25.8/-10.6; capsule 6.06/-22.0/-6.5; arrival 2.23/-21.2/-5.8. Individual gains .35/.55/.40/.26/.32 times master effectsVolume (default .75). No BGM. Uploaded effects replace synthesized tones.

Button click is delegated with exclusions for explicit result/reveal/answer sounds and reading controls. Captured click does not add a second tone to answers, draw, exchange or mute. Correct/wrong answer reads after 650ms, with fade before speech. Gacha fades out when result appears (existing animation timing preserved); arrival replaces it. Exclusive groups prevent stacking, canceled/delayed requests cannot play late, hidden document suspends audio. First pointer/keyboard action unlocks and preloads Web Audio. Missing/offline clips fail silently; service worker caches effects.

Volume 0-100 control in how-to panel, saved in existing settings and supported by backup validation. Existing effects mute retained. Eighteen Node tests passed, covering new sound engine plus existing learning, exchange, mastery, filters and backups. Browser/iOS loudness remains device dependent; no claim of physical iPhone audio testing.
