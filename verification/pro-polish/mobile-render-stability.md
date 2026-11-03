# Mobile selection and tap rendering

Membership changes previously called collection(), which destroyed and recreated every card SVG, raster image and morphology filter. On iOS this can show the independently rendered vector feet before the filtered raster body is repainted. toggleFavorite/clearRoom now update only existing membership badges, class, count and button state; SVG/image/filter nodes remain unchanged. No character art or rig geometry was changed.

Custom role=button room friends now suppress WebKit tap highlight, selection/callout and pointer-induced outline. Keyboard focus-visible remains; pointer marker is removed on keyboard input. Touch reaction remains enabled.

19 Node tests passed, including new invariant checks for SVG identity, ordered favorites, ownership guard, five-member limit, button states, clear-all and untouched points/learning clears. Existing audio/backup/mastery/exchange/filter tests pass. Actual iPhone WebKit rendering not available in this environment; fix removes the full-rebuild cause rather than delaying or hiding the foot/body flash.
